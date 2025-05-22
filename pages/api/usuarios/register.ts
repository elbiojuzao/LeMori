  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao registrar usuário';
    res.status(500).json({ message: errorMessage });
  } 