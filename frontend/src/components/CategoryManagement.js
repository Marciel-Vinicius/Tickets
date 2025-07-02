import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup';
import {
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    IconButton,
    Stack,
    Typography,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getCategories, createCategory, deleteCategory } from '../services/api';

const schema = object({
    type: string().required('Tipo é obrigatório'),
    name: string().required('Nome é obrigatório')
});

export default function CategoryManagement({ token }) {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const { handleSubmit, control, reset, watch, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { type: 'loja', name: '' }
    });

    const currentType = watch('type');

    const fetchList = async type => {
        setLoading(true);
        try {
            const res = await getCategories(type, token);
            setList(Array.isArray(res.data) ? res.data : []);
        } catch {
            setList([]);
            console.error(`Erro ao carregar categorias (${type})`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList(currentType);
    }, [currentType]);

    const onSubmit = async data => {
        setSubmitLoading(true);
        try {
            await createCategory(data, token);
            fetchList(data.type);
            reset({ type: data.type, name: '' });
        } catch {
            alert('Erro ao criar categoria');
        } finally {
            setSubmitLoading(false);
        }
    };

    const onDelete = async id => {
        if (!window.confirm('Deseja excluir?')) return;
        try {
            await deleteCategory(id, token);
            fetchList(currentType);
        } catch {
            alert('Erro ao excluir');
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Gerenciar Categorias
            </Typography>

            {/* Form de Criação */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <FormControl fullWidth error={!!errors.type}>
                                <InputLabel>Tipo</InputLabel>
                                <Select {...field} label="Tipo">
                                    <MenuItem value="loja">Loja</MenuItem>
                                    <MenuItem value="contato">Contato</MenuItem>
                                    <MenuItem value="ocorrencia">Ocorrência</MenuItem>
                                </Select>
                                {errors.type && <Typography color="error">{errors.type.message}</Typography>}
                            </FormControl>
                        )}
                    />
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                label="Nome"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                {...field}
                            />
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

            {/* Lista de Categorias */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={1}>
                    {(Array.isArray(list) ? list : []).map(item => (
                        <Box
                            key={item.id}
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
                            <Typography>{item.name}</Typography>
                            <IconButton color="error" onClick={() => onDelete(item.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
