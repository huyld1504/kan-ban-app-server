const router = require('express').Router();
const validation = require('../middlewares/validation');
const tokenHandler = require('../middlewares/tokenHandler');
const boardController = require('../controllers/board');
const {param} = require('express-validator');

router.post(
    '/',
    tokenHandler.verifyToken,
    boardController.create
);

router.get(
    '/',
    tokenHandler.verifyToken,
    boardController.getAll
);

router.put(
    '/',
    tokenHandler.verifyToken,
    boardController.updatePosition
);

router.get(
    '/favorites',
    tokenHandler.verifyToken,
    boardController.getFavorites
)

router.put(
    '/favorites',
    tokenHandler.verifyToken,
    boardController.updateFavoritePosition
)

router.get(
    '/:boardId',
    param('boardId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid ID');
        } else return Promise.resolve();
    }),
    validation.validate,
    tokenHandler.verifyToken,
    boardController.getOne
);

router.put(
    '/:boardId',
    param('boardId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid ID');
        } else return Promise.resolve();
    }),
    validation.validate,
    tokenHandler.verifyToken,
    boardController.update
);

router.delete(
    '/:boardId',
    param('boardId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid ID');
        } else return Promise.resolve();
    }),
    validation.validate,
    tokenHandler.verifyToken,
    boardController.delete
);

module.exports = router;