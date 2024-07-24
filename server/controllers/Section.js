const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async(req , res) => {
    try {
        const {sectionName , courseId } = req.body;

        if(!sectionName || !courseId){
            return res.status(404).json({
                success:false,
                message:"Failed to create section. All fields required",
            });
        }

        const newSection = await Section.create({sectionName});

        const updatedCourse = await Course.findByIdAndUpdate(courseId , {
            $push:{
                courseContent : newSection._id ,
            }
        } , {new:true});
        // populate both section and subsection : 


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


exports.updateSection = async(req , res) => {
    try{
        const {sectionName , sectionId} = req.body;

        if(!sectionName || !sectionId){
            return res.status(404).json({
                success:false,
                message:"Failed to update section. All fields required",
            });
        }

        const updatedSection = await Section.findByIdAndUpdate(sectionId , {sectionName} , {new:true});

        return res.status(200).json({
            success:true,
            message:"Section Updated",
            data:updatedSection,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Update Section Failed",
        });
    }
}

exports.deleteSection = async(req ,res) => {
    try{
        // sent in parameter
        // route/deleteSection/:id
        const {sectionId} = req.params;

        await Section.findByIdAndDelete(sectionId);

        // TODO[Testing]: Do we need to delete the entry from the course Schema. // imp imp imp 

        return res.status(200).json({
            success:true,
            message:"Deleted Successfully",
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Delete Section Failed",
        });
    }
}