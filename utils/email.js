const nodemailer = require('nodemailer');

//this below function is the function that will be used to send email
const sendEmail = async options => {
    //the options here are the email address where we want to send the email
    //the subject line
    //the email content 
    //and some other stuff

    //1. create a transporter
    //transporter is basically a service that will actually send the email, node.js does not send the email itself
    const transporter = nodemailer.createTransport({
        service: 'Gmail', //specify the service that you want to use for sending emails
        auth: { // authentication 
            user: 'ekart179@gmail.com', //specify the user email that is the email through which you want to send email
            pass: 'ekarthelloworld@gmail.com' //password of the user email that will be used to send the emails
        }
        //activate in gmail "less secure app" option
    })
    //2. define email options
    const mailOptions = { // as we specified above email options are where we want to send the email, what will be its subject, what will be the mail content etc.
       from: 'Ekart <ekart179@gmail.com>',
       to: options.email, //we have specified this field to be dynamic so that it takes the value as specified by the user
       subject: options.subject,
       text: options.message 
       //we can also convert this mail to html to beautify it using html key value pair
    }

    //3. actually the send the email with nodemailer
    await transporter.sendMail(mailOptions); //this is async function
}

module.exports = sendEmail;