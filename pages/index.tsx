import axios from 'axios';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const DesktopPage = () => {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<any>({});

  useEffect(() => {
    const socket = io('http://localhost:3000');

    socket.on('barcode_data', async (data) => {
      setBarcode(data);
      if (data) {
        const response = await axios.get(`https://world.openfoodfacts.net/api/v3/product/${data}?cc=it&lc=it&tags_lc=it&fields=all`)
        if (response.data) {
          setProduct(response.data.product)
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      {barcode &&
        <div>
          <p>Dati ricevuti: {barcode}</p>
        </div>
      }
      {Object.keys(product).length !== 0 &&
        <div>
          <p>{product?.brands} - {product?.product_name}</p>
          <img src={product?.image_url} alt={product?.product_name} />
        </div>
      }

    </div>
  );
};

export default DesktopPage;
