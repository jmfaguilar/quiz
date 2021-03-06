var models = require('../models/models.js');

// Autoload :id - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
			where: { id: Number(quizId) },
			include: [{ model: models.Comment }]
		}).then(function (quiz) {
			if (quiz) { 
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId)); }
		}).catch(function (error) { next(error); });
};

// GET /quizes
exports.index = function(req, res, next) {
	models.Quiz.findAll().then(function (quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
	}).catch(function (error) { next(error); });
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show.ejs', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer.ejs', { quiz: req.quiz, respuesta: resultado, errors: [] });
};

// GET /quizes/search
exports.search = function(req, res, next) {
	if (req.query.search) {
		var busqueda  = req.query.search.replace(" ", "%");
		models.Quiz.findAll({ where:["pregunta like ?", '%'+busqueda+'%'], order:'pregunta ASC' })
		.then(function (quizes) { res.render('quizes/search.ejs', { quizes: quizes, errors: [] }); })
		.catch(function (error) { next(error); });
	} else {
		models.Quiz.findAll().then(function (quizes){
			res.render('quizes/index.ejs', { quizes: quizes, errors: [] });
		}).catch(function (error) { next(error); });
	}
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(  //crea objeto quiz
		{ pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema" }	
	);
	res.render('quizes/new.ejs', { quiz: quiz, errors: [] });
};

// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build(req.body.quiz);
	quiz.validate().then(function (err) {
		if (err) {  
			res.render('quizes/new.ejs', {quiz: quiz, errors: err.errors});
		} else {
			// guarda en la DB los campos pregunta y respuesta de quiz
			quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function() {
				res.redirect('/quizes'); });  // Redirección HTTP (URL relativo) a la lista de preguntas
		}
	});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;  // autoload de instancia de quiz
	res.render('quizes/edit.ejs', { quiz: quiz, errors: [] });
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz.validate().then(function (err) {
		if (err) {  
			res.render('quizes/edit.ejs', {quiz: req.quiz, errors: err.errors});
		} else {
			// guarda en la DB los campos pregunta y respuesta
			req.quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function() {
				res.redirect('/quizes'); });  // Redirección HTTP (URL relativo) a la lista de preguntas
		}
	});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function() { res.redirect('/quizes'); })
	.catch(function (error) { next(error); });
}; 