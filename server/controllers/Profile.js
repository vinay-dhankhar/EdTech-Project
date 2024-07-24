const User= require('../models/User');
const Profile = require('../models/Profile');

// Here we have already generated an empty profile object while creating the USER object in database
// So here we are updating that empty profile object

// But if we dont create that empty profile object then we will Create the profile object and update the associated user with that object


// IMPORTANT THINGS :
// how tp schedule a delete account request
// Crone JOB
// Multi Level Populate Statement
// Proxy Server 

exports.updateProfile = async(req , res) => {
    try{
        const {dateOfBirth="" , about="" , contactNumber , gender} = req.body;

        const id = req.user.id;

        const userDetails = await User.findById(id);

        const profileId = userDetails.additionalDetails;

        const profileDetails = await Profile.findById(profileId);
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        profileDetails.gender=gender;
        await Profile.save();

        // when we do the above steps : the fetched entry will be updated and no new entry made 

        return res.status(200).json({
            success:true,
            message:"Profile Updated",
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update Profile",
        });
    }
}

exports.deleteAccount = async(req , res) => {
    try{

        const id = req.user.id;

        const userDetails = await User.findById(id);

        // TODO Hw : Unenroll user from all enrolled courses

        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        await User.findByIdAndDelete({_id:id});

        return res.status(200).json({
            success:true,
            message:"Acc deleted"
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Delete failed"
        })
    }
}