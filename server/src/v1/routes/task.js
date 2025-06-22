const router = require('express').Router({ mergeParams: true });
const validation = require('../middlewares/validation');
const tokenHandler = require('../middlewares/tokenHandler');
const taskController = require('../controllers/task');
const { param, body } = require('express-validator');

router.post(
    '/',
    param('boardId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid Board ID');
        } else return Promise.resolve();
    }),
    body('sectionId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid Section ID');
        } else return Promise.resolve();
    }),
    validation.validate,
    tokenHandler.verifyToken,
    taskController.create
);

router.put(
    '/update-position',
    param('boardId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid Board ID');
        } else return Promise.resolve();
    }),
    validation.validate,
    tokenHandler.verifyToken,
    taskController.updatePosition
);

router.put(
    '/:taskId',
    param('boardId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid Board ID');
        } else return Promise.resolve();
    }),
    param('taskId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid Task ID');
        } else return Promise.resolve();
    }),
    validation.validate,
    tokenHandler.verifyToken,
    taskController.update
);

router.delete(
    '/:taskId',
    param('boardId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid Board ID');
        } else return Promise.resolve();
    }),
    param('taskId').custom(value => {
        if (!validation.isObjectId(value)) {
            return Promise.reject('Invalid Task ID');
        } else return Promise.resolve();
    }),
    validation.validate,
    tokenHandler.verifyToken,
    taskController.delete
);

module.exports = router;


