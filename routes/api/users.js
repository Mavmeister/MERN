const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config')

const User = require('../../models/User');

// @route   GET api/users
// @desc    test route
// @access  Public
router.get('/', (req, res) => res.send('User route'));

// @route   POST api/users
// @desc    test route
// @access  Public
router.post('/', [
  check('name', 'Name is required')
    .not()
    .isEmpty(),
  check('email', 'Email is required')
    .isEmail(),
  check('password', 'Please enter a password with 5 or more characters')
    .isLength({ min: 5 })
], async (req, res) => { 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({errors: [{ msg: 'User already exists' }]})
    }

    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })

    user = new User({
      email, 
      name,
      avatar,
      password
    })
    console.log(user)
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload, 
      config.get('jwtSecret'),
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token })
      }
    )
  } catch(err) {
    console.error('Error:', err)
    res.status(500).send('Server error')
  }
})

// @route   PUT api/users
// @desc    test route
// @access  Public
router.put('/', (req, res) => { 
  console.log("Posting:", req.body)
  res.send('User route')
})

// @route   DELETE api/users
// @desc    test route
// @access  Public
router.delete('/', (req, res) => { 
  console.log("Posting:", req.body)
  res.send('User route')
})


module.exports = router;