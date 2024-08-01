const Listing = require("../models/listing");  

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    // populate for -> tells Mongoose to populate the reviews field of the Listing document.
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate : {
            path : "author",
        },
    })
    .populate("owner");
    if (!listing) {
        req.flash("error", "Lisiting you requseted for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    let { title, description, image, price, location, country } = req.body;
    const newListings = new Listing({
        title: title,
        description: description,
        image: image,
        price: price,
        location: location,
        country: country,
    });
    // adding to database
    newListings.owner = req.user._id;
    newListings.image = {url,filename};
    await newListings.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Lisiting you requseted for does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload" , "/upload/h_150,w_100");

    res.render("listings/edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let { title, description, image, price, location, country } = req.body

    // cheack if not right data then handle error
    //if(!(title, description, image, price, location, country)){
    //    throw new ExpressError(400 , "Send Valid data for listingssss");
    // };

    let listing = await Listing.findByIdAndUpdate(id, { title, description, image, price, location, country });

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destoryListing = async (req, res) => {
    let { id } = req.params;
    let deletedListings = await Listing.findByIdAndDelete(id);
    console.log(deletedListings);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};