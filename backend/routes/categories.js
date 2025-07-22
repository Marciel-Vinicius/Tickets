// backend/routes/categories.js
const express = require('express')
const { authorizeSector } = require('../middleware/auth')
const { query } = require('../db')

const router = express.Router()
const types = ['lojas', 'contatos', 'ocorrencias']

// GET /api/categories
// → retorna sempre { lojas: [...], contatos: [...], ocorrencias: [...] }
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
        res.json(result)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// POST /api/categories/:type
// → só DEV+SAF
router.post('/:type', authorizeSector('DEV+SAF'), async (req, res) => {
    const { type } = req.params
    const { value } = req.body
    if (!types.includes(type) || !value) return res.sendStatus(400)
    try {
        await query(`INSERT INTO ${type}(value) VALUES($1)`, [value])
        res.sendStatus(201)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// PUT /api/categories/:type/:oldValue
// → só DEV+SAF
router.put('/:type/:oldValue', authorizeSector('DEV+SAF'), async (req, res) => {
    const { type, oldValue } = req.params
    const { value } = req.body
    if (!types.includes(type) || !value) return res.sendStatus(400)
    try {
        await query(
            `UPDATE ${type} SET value = $1 WHERE value = $2`,
            [value, oldValue]
        )
        res.json({ value })
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

// PUT /api/categories/:type/:value/inativar
// → só DEV+SAF
router.put(
    '/:type/:value/inativar',
    authorizeSector('DEV+SAF'),
    async (req, res) => {
        const { type, value } = req.params
        if (type !== 'contatos') return res.sendStatus(400)
        try {
            await query(
                'UPDATE contatos SET active = false WHERE value = $1',
                [value]
            )
            res.sendStatus(204)
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
        }
    }
)

// DELETE /api/categories/:type/:value
// → só DEV+SAF
router.delete(
    '/:type/:value',
    authorizeSector('DEV+SAF'),
    async (req, res) => {
        const { type, value } = req.params
        if (!types.includes(type)) return res.sendStatus(400)
        try {
            await query(`DELETE FROM ${type} WHERE value = $1`, [value])
            res.sendStatus(204)
        } catch (err) {
            console.error(err)
            res.sendStatus(500)
        }
    }
)

module.exports = router
