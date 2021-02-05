exports.homePage = (req, res) => {
	res.render('index');
};

exports.add = (req, res) => {
	res.render('editStore', { title: 'Add Store' });
};
