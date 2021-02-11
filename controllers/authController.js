const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed login',
	successRedirect: '/',
	successFlash: 'Successfully logged in!',
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Successfully logged out');
	res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
		return;
	}

	req.flash('error', 'Oops, you must be logged in!');
	res.redirect('/login');
};

exports.forgot = async (req, res) => {
	const user = await User.findOne({ email: req.body.email });
	//Check if user exists
	if (!user) {
		req.flash('error', 'No user exists!');
		res.redirect('/login');
	}
	//if user exists set rest token
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();

	//Send reset email
	const resetURl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	req.flash('success', `${resetURl}`);
	res.redirect('/login');
};

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() },
	});

	if (!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}

	res.render('reset', { title: 'Reset your password' });
};

exports.confirmedPasswords = (req, res, next) => {
	if (req.body.password === req.body['password-confirm']) {
		next();
		return;
	}
	req.flash('error', 'Passwords do not match');
	res.redirect('back');
};

exports.update = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() },
	});

	if (!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword(), user);

	await user.setPassword(req.body.password);
	user.resetPasswordExpires = undefined;
	user.resetPasswordToken = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Nice! Password reset.');
	res.redirect('/');
};
