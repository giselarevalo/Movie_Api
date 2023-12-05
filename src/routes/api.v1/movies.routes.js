const { list, detail, create } = require('../../controllers/moviesController');

const router = require ('express').Router();

/* /api/v1/movies */

router
    .get('/',list)
    .get('/:id',detail)
    .post('/',create)

module.exports = router 