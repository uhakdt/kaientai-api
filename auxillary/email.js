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
    text: `Order Details:
  
    Order ID: ${dataMain.orderID}
    User ID: ${dataMain.intUserID}
    Supplier ID: ${dataMain.supplierID}
    Date & Time: ${dataMain.dateAndTime}
    Total Price: ${dataMain.totalAmount}
    Name: ${dataMain.name}
    Email: ${dataMain.email}
    Phone Number: ${dataMain.phone}
    Address1: ${dataMain.address1}
    Postcode: ${dataMain.postcode}
    City: ${dataMain.city}
    Country: ${dataMain.country}
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
    text: `Hi ${dataMain.supplierContactName},
    
    You have received an order from your website. The order can be fulfiled by us and so we are now verifying this and will send you an email upon verification. The order details are:

    OrderID: ${dataMain.extOrderID}
    Date & Time: ${dataMain.dateAndTime}
    Total Price: ${dataMain.totalAmount}
    Name: ${dataMain.name}
    Email: ${dataMain.email}
    Phone Number: ${dataMain.phone}
    Address1: ${dataMain.address1}
    Postcode: ${dataMain.postcode}
    City: ${dataMain.city}
    Country: ${dataMain.country}

    Thank you!!
    
    Kindest Regards,
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

export function SendEmailToKaientaiOrderUpdate (dataMain) {
  const mailOptionsToTeam = {
    from: process.env.GMAIL,
    to: 'uhakdt@gmail.com, mierdluffy@gmail.com',
    subject: 'KLF Order Update! 🙄',
    text: `Order Details:
  
    Order ID: ${dataMain.orderID}
    User ID: ${dataMain.intUserID}
    Supplier ID: ${dataMain.supplierID}
    Date & Time: ${dataMain.dateAndTime}
    Total Price: ${dataMain.totalAmount}
    Name: ${dataMain.name}
    Email: ${dataMain.email}
    Phone Number: ${dataMain.phone}
    Address1: ${dataMain.address1}
    Postcode: ${dataMain.postcode}
    City: ${dataMain.city}
    Country: ${dataMain.country}
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

export function SendEmailToKaientaiOrderCancelled (dataMain) {
  const mailOptionsToTeam = {
    from: process.env.GMAIL,
    to: 'uhakdt@gmail.com, mierdluffy@gmail.com',
    subject: 'KLF Cancelled Order! 🤬',
    text: `Order Details:
  
    Order ID: ${dataMain.orderID}
    User ID: ${dataMain.intUserID}
    Supplier ID: ${dataMain.supplierID}
    Date & Time: ${dataMain.dateAndTime}
    Total Price: ${dataMain.totalAmount}
    Name: ${dataMain.name}
    Email: ${dataMain.email}
    Phone Number: ${dataMain.phone}
    Address1: ${dataMain.address1}
    Postcode: ${dataMain.postcode}
    City: ${dataMain.city}
    Country: ${dataMain.country}
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

export function SendEmailToSupplierOrderCancelled (dataMain) {
  const mailOptionsToSupplier = {
    from: process.env.GMAIL,
    to: `${dataMain.supplierContactEmail}`,
    subject: 'Kaientai local Fulfilment: Cancelled Order',
    text: `Hi ${dataMain.supplierContactName},
    
    The order below has been cancelled and we are now aware of this and will give you a verification upon confirmation of the cancellation:

    OrderID: ${dataMain.orderID}
    UserID: ${dataMain.extUserID}
    Date & Time: ${dataMain.dateAndTime}
    Total Price: ${dataMain.totalAmount}
    Name: ${dataMain.name}
    Email: ${dataMain.email}
    Phone Number: ${dataMain.phone}
    Address1: ${dataMain.address1}
    Postcode: ${dataMain.postcode}
    City: ${dataMain.city}
    Country: ${dataMain.country}

    Thank you!!
    
    Kindest Regards,
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