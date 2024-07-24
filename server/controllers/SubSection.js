const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const {uploadImageToCloudinary} = require('../utils/imageUploader');


// create subsection : 
exports.createSubSection = async(req , res) => {
    try {

        // fetch data  and validate 
        // extract file 
        // upload video to cloudinary 
        // create the subsection 
        const {sectionId , title , timeDuration , description} = req.body;

        const videoFile = req.files.videoFile;

        if(!sectionId || !timeDuration || !title || !description || !videoFile){
            return res.status(400).json({
                success:false,
                message:"All fields required",
            });
        }

        const uploadDetails = await uploadImageToCloudinary(videoFile , process.env.FOLDER_NAME);

        const subsection = await SubSection.create({
            title , timeDuration , description , videoUrl:uploadDetails.secure_url
        });

        const updatedSection = await Section.findByIdAndUpdate(sectionId , {
            $push:{
                subSection:subsection._id,
            }
        } , {new:true}).populate('subSection').exec();
        // HW : log updated section here after adding populate.


        return res.status(200).json({
            success:true,
            message:"Section Created",
            data:updatedCourse,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create section",
        });
    }
}

// HW : update subsection and delete subsection
