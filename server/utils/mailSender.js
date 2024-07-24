const nodemailer = require('nodemailer');

async function mailSender(email , title , body){
    try{

        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            },
        });


        let info = await transporter.sendMail({
            from:"Edtech - Vinay Dhankhar",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        });

        console.log(info);

    }
    catch(error){
        console.log("error occurred in mailSender " , error);
    }
}

module.exports = mailSender;