const passport = require('passport')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "satdemo9@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.isAuth = (req,res,done)=>{
    return passport.authenticate('jwt');
}
exports.sanitizeUser = (user)=>{
    return {id:user.id, role:user.role};
}
exports.cookieExtractor = (req)=>{
    let token = null;
    if(req && req.cookies) token = req.cookies['jwt'];
    return token;
}
exports.sendMail = async({to, subject, text, html})=>{
    const info = await transporter.sendMail({
        from: '"Ecommerce" <demo9@gmail.com>',
        to,
        subject,
        text,
        html
    })
    return info
}