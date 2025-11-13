import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const [customer, setCustomer] = useState({ name: '', contact: '', address: '' });
  const [items, setItems] = useState([]);
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [isPrinting, setIsPrinting] = useState(false);

  const addItem = () => {
    if (product && price && quantity) {
      setItems([...items, { product, price: parseFloat(price), quantity: parseInt(quantity) }]);
      setProduct('');
      setPrice('');
      setQuantity('');
    }
  };

  const removeItem = index => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = (total * taxRate) / 100;
  const grandTotal = total + taxAmount;

  const downloadInvoice = () => {
    setIsPrinting(true); // hide action column
    setTimeout(() => {
      const input = document.getElementById('invoice');
      html2canvas(input, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

        const imgScaledWidth = imgWidth * ratio;
        const imgScaledHeight = imgHeight * ratio;

        const marginX = (pdfWidth - imgScaledWidth) / 2;
        const marginY = 10;

        pdf.addImage(imgData, 'PNG', marginX, marginY, imgScaledWidth, imgScaledHeight);
        pdf.save('invoice.pdf');
        setIsPrinting(false); // restore action column
      });
    }, 100); // wait for DOM to update
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Edit <code>src/App.js</code> and save to reload.</p>
      </header>

      <h1>Billing Software</h1>

      <div className="customer-section">
        <h3>Customer Info</h3>
        <input placeholder="Name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
        <input placeholder="Contact" value={customer.contact} onChange={e => setCustomer({ ...customer, contact: e.target.value })} />
        <input placeholder="Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
      </div>

      <div className="input-section">
        <h3>Product Entry</h3>
        <input placeholder="Product" value={product} onChange={e => setProduct(e.target.value)} />
        <input placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        <input placeholder="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
        <button onClick={addItem}>Add Item</button>
      </div>

      <div id="invoice" className="invoice">
        <h2>Invoice</h2>

        <div className="invoice-header">
          <div>
            <strong>Customer Name:</strong> {customer.name}<br />
            <strong>Contact:</strong> {customer.contact}<br />
            <strong>Address:</strong> {customer.address}
          </div>
          <div>
            <strong>Date:</strong> {new Date().toLocaleDateString()}<br />
            <strong>Invoice #:</strong> INV-{Date.now().toString().slice(-6)}
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price (₹)</th>
              <th>Quantity</th>
              <th>Subtotal (₹)</th>
              {!isPrinting && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.product}</td>
                <td>{item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>{(item.price * item.quantity).toFixed(2)}</td>
                {!isPrinting && (
                  <td>
                    <button onClick={() => removeItem(idx)}>Remove</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-summary">
          <div><strong>Subtotal:</strong> ₹{total.toFixed(2)}</div>
          <div><strong>Tax ({taxRate}%):</strong> ₹{taxAmount.toFixed(2)}</div>
          <div><strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}</div>
        </div>
      </div>

      <button onClick={downloadInvoice}>Download Invoice</button>
    </div>
  );
}

export default App;