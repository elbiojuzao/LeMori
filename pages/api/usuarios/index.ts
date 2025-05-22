  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao listar usuários';
    res.status(500).json({ message: errorMessage });
  } 