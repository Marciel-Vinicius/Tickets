import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, string } from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  getCategories,
  createAtendimento,
  updateAtendimento
} from '../services/api';

const schema = object({
  dia: string().required('Data é obrigatória'),
  hora_inicio: string().required('Hora início é obrigatória'),
  hora_fim: string().required('Hora fim é obrigatória'),
  loja: string().required('Loja é obrigatória'),
  contato: string().required('Contato é obrigatório'),
  ocorrencia: string().required('Ocorrência é obrigatória')
});

export default function AtendimentoForm({
  token,
  atendente,
  editing,
  onSave,
  onCancel
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [loading, setLoading] = useState(false);
  const [lojas, setLojas] = useState([]);
  const [contatos, setContatos] = useState([]);
  const [ocorrencias, setOcorrencias] = useState([]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      dia: today,
      hora_inicio: '',
      hora_fim: '',
      loja: '',
      contato: '',
      ocorrencia: ''
    }
  });

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    getCategories('loja', token).then(r => setLojas(r.data));
    getCategories('contato', token).then(r => setContatos(r.data));
    getCategories('ocorrencia', token).then(r => setOcorrencias(r.data));
  }, [token]);

  useEffect(() => {
    if (editing) {
      reset({
        dia: editing.dia.split('T')[0],
        hora_inicio: editing.hora_inicio,
        hora_fim: editing.hora_fim,
        loja: editing.loja,
        contato: editing.contato,
        ocorrencia: editing.ocorrencia
      });
    } else {
      reset({ dia: today, hora_inicio: '', hora_fim: '', loja: '', contato: '', ocorrencia: '' });
    }
  }, [editing, reset, today]);

  const onSubmit = async data => {
    setLoading(true);
    try {
      const payload = {
        atendente,
        sector: editing?.sector || editing?.sector,
        ...data
      };
      if (editing) {
        await updateAtendimento(editing.id, payload, token);
      } else {
        await createAtendimento(payload, token);
      }
      onSave();
      reset();
    } catch {
      alert('Erro ao salvar atendimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" gutterBottom>
        {editing ? 'Editar Atendimento' : 'Novo Atendimento'}
      </Typography>
      <Stack spacing={2}>
        <Controller
          name="dia"
          control={control}
          render={({ field }) => (
            <TextField
              label="Data"
              type="date"
              InputLabelProps={{ shrink: true }}
              error={!!errors.dia}
              helperText={errors.dia?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="hora_inicio"
          control={control}
          render={({ field }) => (
            <TextField
              label="Hora Início"
              type="time"
              InputLabelProps={{ shrink: true }}
              error={!!errors.hora_inicio}
              helperText={errors.hora_inicio?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="hora_fim"
          control={control}
          render={({ field }) => (
            <TextField
              label="Hora Fim"
              type="time"
              InputLabelProps={{ shrink: true }}
              error={!!errors.hora_fim}
              helperText={errors.hora_fim?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="loja"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.loja}>
              <InputLabel>Loja</InputLabel>
              <Select label="Loja" {...field}>
                {lojas.map(l => (
                  <MenuItem key={l.id} value={l.name}>
                    {l.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.loja && (
                <Typography variant="caption" color="error">
                  {errors.loja.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="contato"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.contato}>
              <InputLabel>Contato</InputLabel>
              <Select label="Contato" {...field}>
                {contatos.map(c => (
                  <MenuItem key={c.id} value={c.name}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.contato && (
                <Typography variant="caption" color="error">
                  {errors.contato.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="ocorrencia"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.ocorrencia}>
              <InputLabel>Ocorrência</InputLabel>
              <Select label="Ocorrência" {...field}>
                {ocorrencias.map(o => (
                  <MenuItem key={o.id} value={o.name}>
                    {o.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.ocorrencia && (
                <Typography variant="caption" color="error">
                  {errors.ocorrencia.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <Box sx={{ position: 'relative', mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {editing ? 'Atualizar' : 'Cadastrar'}
          </Button>
          {loading && (
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

        {editing && (
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            fullWidth
          >
            Cancelar
          </Button>
        )}
      </Stack>
    </Box>
  );
}
