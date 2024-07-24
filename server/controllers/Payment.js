const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const mailSender = require('../utils/mailSender');
const User = require('../models/User');

const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");

exports.capturePayment = async(req ,res) => {
    const {course_id} = req.body;
    const userId = req.user.id;

    let course;
    try{
        course = await Course.findById(course_id);
        if(!course) {
            return res.json({
                success:false,
                message:'Could not find the course',
            });
        }

        //user already has that course

        // convert the userId from string to ObjectID typecasting 
        const uid = new mongoose.Types.ObjectId(userId);
        // include to check the presence in the array
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled',
            });
        }
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }

    // order create:
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount : amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId
        }
    }

    try{
        //initiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        //return response
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
        });
    }
    catch(error) {
        console.log(error);
        res.json({
            success:false,
            message:"Could not initiate order",
        });
    }
}

//verify Signature of Razorpay and Server

exports.verifySignature = async(req , res) => {
    const webhookSecret = "12345678";
    // our secret key in server

    // secret key we received in the request from razorpay 
    // for authorisation purposes both should match 
    const signature = req.headers["x-razorpay-signature"];


    // the signature is received in hashed format so hash the webhookscret and match
    const shasum = crypto.createHmac("sha256" , webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment authorised");
        // payment done and authorised then do the required actions :
        const {courseId, userId} = req.body.payload.payment.entity.notes;
        try{
            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {$push:{studentsEnrolled: userId}},
                                            {new:true},
            );

            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:'Course not Found',
                });
            }

            console.log(enrolledCourse);

            //find the student andadd the course to their list enrolled courses me 
            const enrolledStudent = await User.findOneAndUpdate(
                                            {_id:userId},
                                            {$push:{courses:courseId}},
                                            {new:true},
            );

            console.log(enrolledStudent);

            //send confirmation mail 

            // currently send direct mail : later update it and integrate it with the tempplate 
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulations from CodeHelp",
                                    "Congratulations, you are onboarded into new CodeHelp Course",
            );

            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature Verified and Course Added",
            });
        }       
        catch(error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        } 
    }
    else {
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        });
    }
}