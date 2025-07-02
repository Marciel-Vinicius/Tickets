import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup';
import {
    Box,
    Typography,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    IconButton,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsers, createUser, deleteUser } from '../services/api';

const schema = object({
    username: string().required('Usuário é obrigatório'),
    password: string().required('Senha é obrigatória'),
    sector: string().required('Setor é obrigatório')
});

export default function UserManagement({ token }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { username: '', password: '', sector: 'DEV' }
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers(token);
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch {
            setUsers([]);
            console.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onSubmit = async data => {
        setSubmitLoading(true);
        try {
            await createUser(data, token);
            fetchUsers();
            reset({ username: '', password: '', sector: data.sector });
        } catch {
            alert('Erro ao criar usuário');
        } finally {
            setSubmitLoading(false);
        }
    };

    const onDelete = async id => {
        if (!window.confirm('Deseja excluir este usuário?')) return;
        try {
            await deleteUser(id, token);
            fetchUsers();
        } catch {
            alert('Erro ao excluir usuário');
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Gerenciar Usuários
            </Typography>

            {/* Formulário */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="Usuário"
                                error={!!errors.username}
                                helperText={errors.username?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                label="Senha"
                                type="password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name="sector"
                        control={control}
                        render={({ field }) => (
                            <FormControl>
                                <InputLabel>Setor</InputLabel>
                                <Select {...field} label="Setor">
                                    <MenuItem value="DEV">DEV</MenuItem>
                                    <MenuItem value="SAF">SAF</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />

                    <Box sx={{ position: 'relative' }}>
                        <Button type="submit" variant="contained" disabled={submitLoading}>
                            Adicionar
                        </Button>
                        {submitLoading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        )}
                    </Box>
                </Stack>
            </Box>

            {/* Lista */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={1}>
                    {(Array.isArray(users) ? users : []).map(u => (
                        <Box
                            key={u.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1
                            }}
                        >
                            <Typography>
                                {u.username} — {u.sector}
                            </Typography>
                            <IconButton color="error" onClick={() => onDelete(u.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
