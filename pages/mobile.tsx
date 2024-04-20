import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
// @ts-ignore
import Quagga from 'quagga';

const MobilePage = () => {
    const [barcodeData, setBarcodeData] = useState("");
    useEffect(() => {
        const socket = io('https://9b2e-80-116-209-81.ngrok-free.app/');

        Quagga.init({
            inputStream: {
                name: 'Live',
                type: 'LiveStream',
                target: document.querySelector('#barcode-scanner'),
                constraints: {
                    facingMode: 'environment',
                    width: { min: 640 },
                    height: { min: 480 },
                    aspectRatio: { min: 4 / 3 }
                },
                singleChannel: false
            },
            locator: {
                patchSize: 'medium',
                halfSample: true
            },
            decoder: {
                readers: ['ean_reader'],
                debug: {
                    drawBoundingBox: true,
                    showFrequency: true,
                    drawScanline: true,
                    showPattern: true
                }
            },
            locate: true
        }, (err: any) => {
            if (err) {
                console.error('Errore durante l\'inizializzazione di Quagga:', err);
                return;
            }
            console.log('Quagga inizializzato con successo');
            Quagga.start();
        });

        const codeCount:any = {};

        Quagga.onDetected((data: any) => {
            const barcodeData = data.codeResult.code;
            console.log('Codice a barre letto:', barcodeData);
            codeCount[barcodeData] = (codeCount[barcodeData] || 0) + 1;
        });

        // Quando il timer scade
        setTimeout(() => {
            // Trova il codice più comune
            let mostCommonCode = null;
            let maxCount = 0;
            for (const code in codeCount) {
                if (codeCount[code] > maxCount) {
                    mostCommonCode = code;
                    maxCount = codeCount[code];
                }
            }

            if (mostCommonCode) {
                console.log('Codice più comune:', mostCommonCode);
                // Invia il codice più comune tramite socket
                socket.emit('mobileData', mostCommonCode);
                setBarcodeData(mostCommonCode);
            } else {
                console.log('Nessun codice rilevato.');
            }

            // Ferma Quagga
            Quagga.stop();
        }, 6000);


        return () => {
            Quagga.stop();
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>Lettore di codici a barre</h1>
            <p>Scan barcode {barcodeData}</p>
            <div id="barcode-scanner"></div>
        </div>
    );
};

export default MobilePage;
