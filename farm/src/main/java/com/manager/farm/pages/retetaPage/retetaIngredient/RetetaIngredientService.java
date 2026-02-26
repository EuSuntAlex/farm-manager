package com.manager.farm.pages.retetaPage.retetaIngredient;

import com.manager.farm.pages.retetaPage.retetaIngredient.commandDto.RetetaIngredientAddDto;
import com.manager.farm.pages.retetaPage.retetaIngredient.commandDto.RetetaIngredientEditDto;
import com.manager.farm.pages.retetaPage.retetaIngredient.queryDto.RetetaIngredientRepository;
import com.manager.farm.pages.retetaPage.queryDto.RetetaRepository;
import com.manager.farm.pages.retetaPage.ingredient.queryDto.IngredientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RetetaIngredientService {

    private final RetetaIngredientRepository retetaIngredientRepository;
    private final RetetaRepository retetaRepository;
    private final IngredientRepository ingredientRepository;

    public RetetaIngredientService(
            RetetaIngredientRepository retetaIngredientRepository,
            RetetaRepository retetaRepository,
            IngredientRepository ingredientRepository) {
        this.retetaIngredientRepository = retetaIngredientRepository;
        this.retetaRepository = retetaRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Transactional
    public RetetaIngredient createRetetaIngredient(RetetaIngredientAddDto dto) {
        // Verifică dacă rețeta există
        if (!retetaRepository.existsById(dto.getRetetaId())) {
            throw new IllegalArgumentException("Rețeta cu ID " + dto.getRetetaId() + " nu există");
        }

        // Verifică dacă ingredientul există
        if (!ingredientRepository.existsById(dto.getIngredientId())) {
            throw new IllegalArgumentException("Ingredientul cu ID " + dto.getIngredientId() + " nu există");
        }

        // Verifică dacă există deja această combinație
        List<RetetaIngredient> existente = retetaIngredientRepository.findByRetetaId(dto.getRetetaId());
        boolean exists = existente.stream()
                .anyMatch(ri -> ri.getIngredientId().equals(dto.getIngredientId()));

        if (exists) {
            throw new IllegalArgumentException("Acest ingredient există deja în rețetă");
        }

        RetetaIngredient ri = new RetetaIngredient();
        ri.setRetetaId(dto.getRetetaId());
        ri.setIngredientId(dto.getIngredientId());
        ri.setCantitate(dto.getCantitate());

        return retetaIngredientRepository.save(ri);
    }

    @Transactional
    public RetetaIngredient updateRetetaIngredient(Long id, RetetaIngredientEditDto dto) {
        RetetaIngredient existing = retetaIngredientRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Legătura nu a fost găsită"));

        if (dto.getCantitate() != null) {
            existing.setCantitate(dto.getCantitate());
        }

        return retetaIngredientRepository.save(existing);
    }

    @Transactional
    public void deleteRetetaIngredient(Long id) {
        if (!retetaIngredientRepository.existsById(id)) {
            throw new IllegalArgumentException("Legătura nu a fost găsită");
        }
        retetaIngredientRepository.deleteById(id);
    }

    public List<RetetaIngredient> getByRetetaId(Long retetaId) {
        return retetaIngredientRepository.findByRetetaId(retetaId);
    }

    public List<RetetaIngredient> getByIngredientId(Long ingredientId) {
        // Ar trebui să adaugi această metodă în repository
        // return retetaIngredientRepository.findByIngredientId(ingredientId);
        throw new UnsupportedOperationException("Metodă neimplementată");
    }
}