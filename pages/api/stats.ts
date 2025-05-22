  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar estatísticas';
    res.status(500).json({ message: errorMessage });
  } 