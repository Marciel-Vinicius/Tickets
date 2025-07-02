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
import {
    getCategories,
    createCategory,
    deleteCategory
} from '../services/api';

const schema = object({
    type: string().required('Tipo é obrigatório'),
    name: string().required('Nome é obrigatório')
});

export default function CategoryManagement({ token }) {
    const [loadingList, setLoadingList] = useState(false);
    const [list, setList] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { type: 'loja', name: '' }
    });

    const fetchList = async type => {
        setLoadingList(true);
        try {
            const res = await getCategories(type, token);
            setList(res.data);
        } catch {
            alert('Erro ao carregar categorias');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchList('loja');
    }, []); // inicial carrega lojas

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

    const handleTypeChange = e => {
        const t = e.target.value;
        reset({ type: t, name: '' });
        fetchList(t);
    };

    const onDelete = async id => {
        try {
            await deleteCategory(id, token);
            fetchList(control._formValues.type);
        } catch {
            alert('Erro ao excluir');
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                Gerenciar Categorias
            </Typography>

            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.type}>
                        <InputLabel>Tipo</InputLabel>
                        <Select label="Tipo" {...field} onChange={e => {
                            field.onChange(e);
                            handleTypeChange(e);
                        }}>
                            <MenuItem value="loja">Loja</MenuItem>
                            <MenuItem value="contato">Contato</MenuItem>
                            <MenuItem value="ocorrencia">Ocorrência</MenuItem>
                        </Select>
                        {errors.type && (
                            <Typography variant="caption" color="error">
                                {errors.type.message}
                            </Typography>
                        )}
                    </FormControl>
                )}
            />

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                label="Novo nome"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                {...field}
                            />
                        )}
                    />
                    <Box sx={{ position: 'relative' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitLoading}
                        >
                            Adicionar
                        </Button>
                        {submitLoading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    mt: '-12px',
                                    ml: '-12px'
                                }}
                            />
                        )}
                    </Box>
                </Stack>
            </Box>

            {loadingList ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={1}>
                    {list.map(item => (
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
                            <IconButton
                                color="error"
                                onClick={() => onDelete(item.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
