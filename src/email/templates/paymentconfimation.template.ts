export class MailTemplates {
  paymentClassesConfirmationTemplate(
    orderId: string,
    userFirstName: string,
    orderDate: string,
    table: string,
    deliveryCharge: number,
    grandTotal: number,
    subtotal: number,
    studentFullName: string,
    studentEmail: string,
    studentPhone: string,
    shippingName: string,
    shippingPhone: string,
    shippingEmail: string,
    shippingAddress: string,
    shippingCity: string,
    shippingState: string,
    shippingPostalCode: string,
    shippingCountry: string,
    reductionCharge: string,
  ) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Enrollment Confirmation</title>
	<style>
		body {
			font-family: "Verdana", sans-serif;
			margin: 0;
			padding: 0;
			background-color: #C1DEFF;
		}
		.email-container {
			max-width: 650px;
			margin: 20px auto;
			background: #ffffff;
			border-radius: 10px;
			padding: 20px;
			border: #2C6FBB solid 1px;
		}
		.logo {
			text-align: center;
			margin-bottom: 10px;
		}
		.header-icon {
			text-align: center;
			margin: 10px 0;
		}
		.header-icon img {
			width: 80px;
			height: auto;
		}
		h1 {
			text-align: center;
			font-size: 20px;
			color: #2C6FBB;
		}
		.subtext {
			text-align: center;
			font-size: 14px;
			color: #666;
			margin-bottom: 20px;
		}
		.order-summary {
			width: 100%;
			border-collapse: collapse;
			margin-top: 20px;
		}
		.order-summary th,
		.order-summary td {
			padding: 10px;
			border-bottom: 1px solid #e0e0e0;
		}
		.order-summary th {
			text-align: left;
			background-color: #f2f2f2;
		}
		.order-summary .price {
			text-align: right;
		}
		.order-summary img {
			max-width: 70px;
			height: auto;
			border-radius: 5px;
		}
		.totals {
			width: 100%;
			border-collapse: collapse;
			margin-top: 10px;
		}
		.totals td {
			padding: 10px;
		}
		.totals .label {
			text-align: left;
			font-weight: bold;
		}
		.totals .amount {
			text-align: right;
		}
		.totals .total-row {
			font-weight: bold;
			background-color: #f2f2f2;
		}
		.details-section {
			display: flex;
			justify-content: space-between;
			margin-top: 20px;
		}
		.details-section .details-box {
			width: 48%;
			padding: 10px;
			border: 1px solid #e0e0e0;
			border-radius: 5px;
		}
		.details-section .heading {
			font-size: 16px;
			font-weight: bold;
			color: #2C6FBB;
			margin-bottom: 10px;
		}
		.details-section .line {
			font-size: 14px;
			margin-bottom: 5px;
		}
		.details-section .label {
			font-weight: bold;
		}
		.footer {
			text-align: center;
			margin-top: 20px;
			font-size: 12px;
			color: #666;
		}
		.footer a {
			color: #007BFF;
			text-decoration: none;
		}
		.social-icons {
			margin: 10px 0;
		}
		.social-icons img {
			width: 24px;
			height: 24px;
			margin: 0 5px;
		}
		.footer .address {
			margin-top: 10px;
		}
		.outside-container {
			max-width: 650px;
			margin: 20px auto;
			text-align: center;
			font-size: 12px;
			color: #666;
		}
		.outside-container a {
			color: #007BFF;
			text-decoration: none;
		}
		.outside-container p {
			margin: 5px 0;
		}
	</style>
</head>
<body aria-disabled="false">
	<div class="logo">
		<span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><img
				src="https://del1.vultrobjects.com/crmaswinibajaj/CRM/Platform/ABlogowithtext.png"
				alt="Aswini Bajaj Logo">
		</span>
	</div>
	<span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
	</span>
	<div class="email-container"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<div class="header-icon"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
				<img src="https://ik.imagekit.io/vt3qjswze/Email%20Templates/reset.png?updatedAt=1728028667386"
					alt="Secure Icon">
			</span></div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<h1><span style="font-size: 24px; font-family: Verdana, Geneva, sans-serif;">Enrollment Confirmation!</span>
		</h1><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<p class="subtext"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Enrollment ID :
				${orderId}<br></span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">${orderDate}</span></p>
		<p class="subtext"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><strong>Hi
					${userFirstName}</strong><strong></strong></span>
			<br><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;"><br></span><span
				style="color: rgb(102, 102, 102); font-family: Verdana, Geneva, sans-serif; font-size: 16px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: center; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: rgb(255, 255, 255); text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; float: none; display: inline !important;"
				id="isPasted">Thank you for choosing Aswini Bajaj Classes! We are thrilled to have you on board as you
				embark on your journey</span>
			<br>
			<br>
		</p><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<table class="order-summary">
			<thead>
				<tr>
					<th><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Product</span></th>
					<th><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Details</span></th>
					<th class="price"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Price</span></th>
				</tr>
			</thead>
			<tbody>
				${table}
			</tbody>
		</table><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<table class="totals">
			<tbody>
				<tr>
					<td class="label"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Subtotal:</span></td>
					<td class="amount"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">₹ ${subtotal}</span></td>
				</tr>
				
				<tr>
					<td class="label"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Shipping:</span></td>
					<td class="amount"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">₹ ${deliveryCharge}</span></td>
				</tr>
				${reductionCharge}
				<tr class="total-row">
					<td class="label"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Total:</span></td>
					<td class="amount"><span
							style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">₹ ${grandTotal}</span></td>
				</tr>
			</tbody>
		</table>
		<span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<div class="details-section"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
			</span>
			<div class="details-box"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div class="heading"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Student
						Details</span></div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div class="line"><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">Name:</span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${studentFullName}</span></div><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div class="line"><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">Phone:</span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${studentPhone}</span></div><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div class="line"><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">Email ID:</span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${studentEmail}</span>
				</div><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
			</div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
			</span>
			<div class="details-box"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="heading"><span
						style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">Shipping Details</span></div>
				<span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">Name:</span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${shippingName}</span></div><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">Email : </span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${shippingEmail}</span></div><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">Phone : </span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${shippingPhone}</span></div><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;" class="label">Shipping
						Address:</span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${shippingAddress}</span></div><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">City: </span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${shippingCity}</span></div><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"
						class="label">State:</span><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"> ${shippingState}</span></div>
				<span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;" class="label">Postal
						Code: </span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
						 ${shippingPostalCode}</span></div><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;" class="label">Country : </span><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
						 ${shippingCountry}</span></div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<div style="text-align: right;" class="line"><span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">If any of the above details needs correction, Please reach out to us within <span
						style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;" class="label">1 working day.</span></span>
			</div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
			</span>
		</div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<div class="footer"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
			</span>
			<p><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">Got a question? Email us at <a
						href="mailto:support@aswinibajajclasses.com">support@aswinibajajclasses.com</a> or call us at <a
						href="https://wa.me/919831244737">+91 98312 44737</a>.</span></p><span
				style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
			</span>
			<div class="social-icons"><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
					<a href="https://www.facebook.com/Aswinibajajclasses/" target="_blank"><img
							src="https://ik.imagekit.io/ylbpi5mzf/facebook%20(1).png" alt="Facebook"></a>
					<a href="https://www.youtube.com/@aswinibajaj" target="_blank"><img
							src="https://ik.imagekit.io/ylbpi5mzf/youtube-symbol.png" alt="YouTube"></a>
					<a href="https://in.linkedin.com/company/finance-mentor-aswini-bajaj" target="_blank"><img
							src="https://ik.imagekit.io/ylbpi5mzf/linkedin.png" alt="LinkedIn"></a>
					<a href="https://www.instagram.com/aswinibajajclasses/?hl=en" target="_blank"><img
							src="https://ik.imagekit.io/ylbpi5mzf/instagram%20(2).png" alt="Instagram"></a>
				</span></div><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
			</span>
			<div class="address"><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<p><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">50 Chowringhee Road, Rear
						Building, 2nd Floor, Kolkata – 700071</span></p><span
					style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
				</span>
				<p><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">© 2024 Aswini Bajaj Classes.
						All rights reserved.</span></p><span
					style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
				</span>
			</div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
			</span>
		</div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
	</div><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
	</span>
	<div class="outside-container"><span style="font-size: 16px; font-family: Verdana, Geneva, sans-serif;">
		</span>
		<p><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;"><a
					href="https://aswinibajajclasses.com/privacy-policy" target="_blank">Privacy Policy</a> | <a
					href="https://aswinibajajclasses.com/terms-and-conditions" target="_blank">Terms &amp; Conditions</a></span></p>
		<span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">
		</span>

		<p><span style="font-size: 14px; font-family: Verdana, Geneva, sans-serif;">This is a system-generated email.
				Please do not reply to this message.</span></p>
	</div>
</body>
</html>`;
  }
}
