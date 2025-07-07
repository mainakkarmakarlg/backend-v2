const invoiceTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: #ffffff;
      margin: 0;
      padding: 20px;
      color: #333333;
      font-size: 12px;
    }

    .container {
      max-width: 800px;
      margin: auto;
      background-color: #ffffff;
      padding: 30px;
      border: 1px solid #e0e0e0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 20px;
    }

    .company-logo {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .logo {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #4a90e2, #7b68ee);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
      margin-right: 15px;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 16px;
      font-weight: 700;
      color: #333333;
      margin-bottom: 5px;
    }

    .invoice-title {
      text-align: right;
      flex: 1;
    }

    .invoice-title h1 {
      font-size: 32px;
      font-weight: 700;
      color: #ff9500;
      margin: 0;
      margin-bottom: 10px;
    }

    .invoice-details {
      text-align: right;
      font-size: 11px;
      color: #666666;
    }

    .company-details {
      margin-bottom: 20px;
      font-size: 11px;
      line-height: 1.4;
    }

    .company-details p {
      margin: 2px 0;
      color: #666666;
    }

    .bill-to {
      margin-bottom: 25px;
      font-size: 11px;
    }

    .bill-to-title {
      font-size: 12px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
    }

    .bill-to p {
      margin: 2px 0;
      color: #666666;
    }

    .customer-name {
      font-weight: 600;
      color: #333333 !important;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 11px;
    }

    th {
      background-color: #ff9500;
      color: white;
      font-weight: 600;
      padding: 12px 8px;
      text-align: center;
    }

    th:first-child {
      text-align: center;
      width: 40px;
    }

    th:last-child {
      text-align: right;
      width: 100px;
    }

    td {
      border: 1px solid #e0e0e0;
      padding: 10px 8px;
      vertical-align: top;
    }

    td:first-child {
      text-align: center;
      font-weight: 600;
    }

    td:last-child {
      text-align: right;
      font-weight: 600;
    }

    .totals-section {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }

    .totals {
      width: 300px;
      font-size: 11px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .totals-row.total {
      font-weight: 700;
      font-size: 12px;
      border-bottom: 2px solid #333333;
      margin-top: 8px;
      padding-top: 8px;
    }

    .total-words {
      margin-top: 15px;
      font-size: 11px;
      font-style: italic;
      color: #666666;
      text-align: right;
    }

    .bank-details {
      margin-top: 40px;
      font-size: 11px;
      line-height: 1.4;
    }

    .bank-title {
      font-size: 12px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
    }

    .bank-details p {
      margin: 2px 0;
      color: #666666;
    }

    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 10px;
      color: #999999;
      border-top: 1px solid #e0e0e0;
      padding-top: 15px;
    }

    .highlight {
      color: #ff9500;
      font-weight: 600;
    }

    strong {
      color: #333333;
    }

    @media print {
      body {
        padding: 0;
        background-color: white;
      }
      .container {
        border: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container" id="invoice">
    <div class="header">
      
       <img src="https://leveragedgrowth.in/wp-content/uploads/2019/12/leverageGrowth-No-Shadow.png" alt="company logo" />
        
      <div class="invoice-title">
        <h1>Tax Invoice</h1>
        <div class="invoice-details">
          <strong>Invoice No.:</strong> {{INVOICE_NO}}<br>
          <strong>Invoice Date:</strong> {{INVOICE_DATE}}
        </div>
      </div>
    </div>

    <div class="company-details">
      <p><strong>Leveraged Growth Private Limited</strong></p>
      <p>50 Chowringhee, Rear Building 2<sup>nd</sup> Floor,</p>
      <p>Kolkata- 700071</p>
      <p>West Bengal, India</p>
      <p><strong class="highlight">GSTIN:</strong> 19ABEFM5098B2Z4</p>
      <p><strong class="highlight">CIN:</strong> U93090WB2018PTC226461</p>
    </div>

    <div class="bill-to">
      <div class="bill-to-title">Bill To</div>
      <p class="customer-name">{{STUDENT_NAME}}</p>
      <p>{{BILLING_ADDRESS}}</p>
      <p>{{BILLING_STATE}}</p>
      <p><strong>GSTIN:</strong> {{COMPANY_GST}}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item & Description</th>
          <th>HSN/SAC</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {{PRODUCT_ROWS}}
      </tbody>
    </table>

    <div class="totals-section">
      <div class="totals">
        <div class="totals-row">
          <span>Sub Total</span>
          <span>{{SUBTOTAL}}</span>
        </div>
        <div class="totals-row">
          <span>IGST (18%)</span>
          <span>{{IGST}}</span>
        </div>
        <div class="totals-row">
          <span>CGST (9%)</span>
          <span>{{CGST}}</span>
        </div>
        <div class="totals-row">
          <span>SGST (9%)</span>
          <span>{{SGST}}</span>
        </div>
        <div class="totals-row total">
          <span>Total</span>
          <span>{{TOTAL}}</span>
        </div>
        <div class="total-words">
          Total In Words: {{TOTAL_IN_WORDS}}
        </div>
      </div>
    </div>

    <div class="bank-details">
      <div class="bank-title">Bank Account Details</div>
      <p><strong>Name:</strong> Leveraged Growth</p>
      <p>Private Limited</p>
      <p><strong>A/C Number:</strong> 128405500261</p>
      <p><strong>IFSC Code:</strong> ICIC0001284</p>
      <p><strong>Bank:</strong> ICICI Bank</p>
      <p><strong>Branch:</strong> Shakespeare Sarani</p>
    </div>

    <div class="footer">
      This is a computer-generated invoice no signature is required.
    </div>
  </div>
</body>
</html>
`;
export default invoiceTemplate;
