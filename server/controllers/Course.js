const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.createCourse = async (req, res) => {
    try {

        // fetch data 
        const { courseName, courseDescription, whatYouWillLearn, price, category } = req.body;

        // get thumbnail image
        const thumbnail = req.files.thumbnailImage;

        //validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // the instructor will already be logged in if creating a course:
        // get id using the auth middleware or use the cookies:
        const instructorID = req.user.id;

        // check Category :
        // above captured Category is the CategoryId and here we want the details of that Category
        const CategoryDetails = await Category.findOne({ category });

        if (!CategoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found",
            });
        }

        // upload to coudinary:
        const thumbnailUrl = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // creating entry of the course.
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructorID,
            whatYouWillLearn,
            price,
            // Category itself we received as id :
            category,
            thumbnail: thumbnailUrl.secure_url,
        });


        // update instructor course list :
        const newIns = await User.findByIdAndUpdate({ instructorID },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );

        const updatedCategoryList = await Category.findByIdAndUpdate({ category },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );

        return res.status(200).json({
            success: true,
            message: "Course created Successfully",
            data: newCourse,
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal error while creating course",
        });
    }
}

exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, {
            courseName: true,
            thumbnail: true,
            price: true,
            instructor: true,
            ratingAndReviews: true,
            studentsEnrolled: true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: allCourses,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error showing all courses",
        });
    }
}


exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;
        const courseDetails = await Course.find(
            { _id: courseId })
            .populate(
                {
                    path: "instructor",
                    populate: {
                        path: "additionalDetails",
                    },
                }
            )
            .populate("category")
            //.populate("ratingAndreviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        //validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Course Details fetched successfully",
            data: courseDetails,
        })

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}