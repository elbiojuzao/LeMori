  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
    res.status(500).json({ message: errorMessage });
  } 