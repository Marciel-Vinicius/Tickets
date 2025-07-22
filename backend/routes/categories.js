// backend/routes/categories.js
const express = require('express')
const { authenticate, authorizeSector } = require('../middleware/auth')
const { query } = require('../db')

const router = express.Router()
const types = ['lojas', 'contatos', 'ocorrencias']

// aplica autenticação a todas as rotas
router.use(authenticate)

// GET /api/categories
// → liberado para qualquer usuário autenticado
router.get('/', async (req, res) => {
    try {
        const result = {}
        for (const t of types) {
            if (t === 'contatos') {
                const { rows } = await query(
                    'SELECT value, active FROM contatos ORDER BY value',
                    []
                )
                result[t] = rows
            } else {
                const { rows } = await query(
                    `SELECT value FROM ${t} ORDER BY value`,
                    []
                )
                result[t] = rows.map(r => ({ value: r.value }))
            }
        }
        return res.json(result)
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
})

// daqui em diante: só DEV ou SAF podem modificar
const canModify = authorizeSector('DEV', 'SAF')

// POST /api/categories/:type
router.post('/:type', canModify, async (req, res) => {
    const { type } = req.params
    const { value } = req.body
    if (!types.includes(type) || !value) return res.sendStatus(400)
    try {
        await query(`INSERT INTO ${type}(value) VALUES($1)`, [value])
        return res.sendStatus(201)
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
})

// PUT /api/categories/:type/:oldValue  (renomear)
router.put('/:type/:oldValue', canModify, async (req, res) => {
    const { type, oldValue } = req.params
    const { value } = req.body
    if (!types.includes(type) || !value) return res.sendStatus(400)
    try {
        await query(
            `UPDATE ${type} SET value = $1 WHERE value = $2`,
            [value, oldValue]
        )
        return res.json({ value })
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
})

// PUT /api/categories/contatos/:value/inativar
router.put(
    '/contatos/:value/inativar',
    canModify,
    async (req, res) => {
        const { value } = req.params
        try {
            await query(
                'UPDATE contatos SET active = false WHERE value = $1',
                [value]
            )
            return res.sendStatus(204)
        } catch (err) {
            console.error(err)
            return res.sendStatus(500)
        }
    }
)

// DELETE /api/categories/:type/:value
router.delete('/:type/:value', canModify, async (req, res) => {
    const { type, value } = req.params
    if (!types.includes(type)) return res.sendStatus(400)
    try {
        await query(`DELETE FROM ${type} WHERE value = $1`, [value])
        return res.sendStatus(204)
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
})

module.exports = router
