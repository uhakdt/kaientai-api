import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL,
		pass: process.env.GMAILPASS
	}
});

export function SendEmailToKaientai (dataMain) {
  const mailOptionsToTeam = {
    from: process.env.GMAIL,
    to: 'uhakdt@gmail.com, mierdluffy@gmail.com',
    subject: 'KLF New Order! 😜',
    text: `Order Details:\n
  
    Order ID: ${dataMain.orderID}\n
    User ID: ${dataMain.intUserID}\n
    Supplier ID: ${dataMain.supplierID}\n
    Date & Time: ${dataMain.dateAndTime}\n
    Total Price: ${dataMain.totalAmount}\n
    Name: ${dataMain.name}\n
    Email: ${dataMain.email}\n
    Phone Number: ${dataMain.phone}\n
    Address1: ${dataMain.address1}\n
    Postcode: ${dataMain.postcode}\n
    City: ${dataMain.city}\n
    Country: ${dataMain.country}\n
    `
  };
  transporter.sendMail(mailOptionsToTeam, function(error, info) {
    if(error){
      console.log(error);
    } else {
      console.log('Email has been sent to Team!');
    }
  });
}

export function SendEmailToSupplier (dataMain) {
  const mailOptionsToSupplier = {
    from: process.env.GMAIL,
    to: `${dataMain.supplierContactEmail}`,
    subject: 'New Order: Kaientai local Fulfilment conditions met',
    text: `Hi ${dataMain.supplierContactName},\n
    
    You have received an order from your website. The order can be fulfiled by us and so we are now verifying this and will send you an email upon verification. The order details are:\n

    OrderID: ${dataMain.orderID}\n
    UserID: ${dataMain.extUserID}\n
    Date & Time: ${dataMain.dateAndTime}\n
    Total Price: ${dataMain.totalAmount}\n
    Name: ${dataMain.name}\n
    Email: ${dataMain.email}\n
    Phone Number: ${dataMain.phone}\n
    Address1: ${dataMain.address1}\n
    Postcode: ${dataMain.postcode}\n
    City: ${dataMain.city}\n
    Country: ${dataMain.country}\n

    Thank you!!\n
    
    Kindest Regards,\n
    Mier at Kaientai`
  };
  
  transporter.sendMail(mailOptionsToSupplier, function(error, info) {
    if(error){
      console.log(error);
    } else {
      console.log(`Email has been sent to ${dataMain.supplierContactName}!`);
    }
  });

}