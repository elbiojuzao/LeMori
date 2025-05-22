  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload';
    res.status(500).json({ message: errorMessage });
  } 