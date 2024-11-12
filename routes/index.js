var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');
const uploadOnCLOUDINARY = require('../utils/cloudinary');
const fs = require('fs');

passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index', { nav: false });
});

router.get('/register', function(req, res, next) {
  res.render('register', { nav: false });
});

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
    name: req.body.fullname
  });

  userModel.register(data, req.body.password)
    .then(function() {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/profile");
      });
    });
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  res.render('profile', { user, nav: true });
});

router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  res.render('show', { user, nav: true });
});

router.get('/cards/post/:postId', isLoggedIn, async function(req, res, next) {
  try {
    const post = await postModel
      .findById(req.params.postId)
      .populate("user", "username"); // Populate user to show username in the template

    if (!post) {
      return res.status(404).send('Post not found');
    }

    res.render('single-post', { post, nav: true });
  } catch (error) {
    console.error("Error fetching post:", error);
    next(error);
  }
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  try {
    // Retrieve all posts and populate the 'user' field in each post
    const posts = await postModel.find().populate("user", "username");

    // Retrieve the currently logged-in user (for header or navigation purposes)
    const user = await userModel.findOne({ username: req.session.passport.user });
    
    // Render the feed page and pass both user and posts data
    res.render('feed', { user, posts, nav: true });
  } catch (error) {
    console.error("Error fetching feed:", error);
    next(error);
  }
});

router.get('/feed/post/:postId', isLoggedIn, async function(req, res, next) {
  try {
    // Fetch the post by ID and populate the user field
    const post = await postModel
      .findById(req.params.postId)
      .populate("user", "username");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    // Render the single post page and pass the post data
    res.render("single-post", { post, nav: true });
  } catch (error) {
    console.error("Error fetching single post:", error);
    next(error);
  }
});

router.get('/add', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('add', { user, nav: true });
});

router.post('/createpost', upload.single("postimage"), isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  let imageUrl = '';
  if (req.file) {
    try {
      const cloudinaryResult = await uploadOnCLOUDINARY(req.file.path);
      imageUrl = cloudinaryResult.secure_url;

      // Delete the file from the local server after uploading to Cloudinary
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return res.status(500).send('Error uploading image');
    }
  }

  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: imageUrl
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });

  if (req.file) {
    try {
      const cloudinaryResult = await uploadOnCLOUDINARY(req.file.path);
      user.profileImage = cloudinaryResult.secure_url;

      // Remove the file after uploading to Cloudinary
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).send("Error uploading image");
    }
  }

  await user.save();
  res.redirect("/profile");
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile",
}), function(req, res, next) {
  res.render('login');
});

router.get("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
