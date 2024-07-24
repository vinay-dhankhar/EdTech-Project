const Category = require('../models/Category');

// create Category by admin

exports.createCategory = async (req, res) => {
    try {
        const { name, decription } = req.body;
        if (!name || !decription) {
            return res.status(400).json({
                success: false,
                message: "All fields required",
            })
        }
        // create entry in db
        const newCategory = Category.create({
            name: name,
            description: description,
        });

        return res.status(200).json({
            success: true,
            message: "Category created",
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.showAllCategorys = async (req, res) => {
    try {
        // find all Categorys and return these values of the Categorys
        const Categorys = await Category.find({}, { name: true, description: true });
        res.status(200).json({
            success: true,
            message: "All Categorys resturned",
            data: Categorys,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.categoryPageDetails = async (req, res) => {
    try {
        //get categoryId
        const { categoryId } = req.body;
        //get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
            .populate("courses")
            .exec();
        //validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Data Not Found',
            });
        }
        //get coursesfor different categories
        const differentCategories = await Category.find({
            _id: { $ne: categoryId },
        })
            .populate("courses")
            .exec();

        //get top 10 selling courses
        //HW - write it on your own

        //return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            },
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}