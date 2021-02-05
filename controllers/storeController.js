const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
	res.render('index');
};

exports.editStore = (req, res) => {
	res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
	const store = await new Store(req.body).save();
	req.flash('success', `Succesfully created ${store.name}`);

	res.redirect(`/store/${store.slug}`);
};
