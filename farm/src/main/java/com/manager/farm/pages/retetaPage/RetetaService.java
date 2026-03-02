package com.manager.farm.pages.retetaPage;

import com.manager.farm.pages.retetaPage.commandDto.RetetaAddDto;
import com.manager.farm.pages.retetaPage.commandDto.RetetaEditDto;
import com.manager.farm.pages.retetaPage.ingredient.queryDto.IngredientRepository;
import com.manager.farm.pages.retetaPage.queryDto.RetetaRepository;
import com.manager.farm.pages.retetaPage.queryDto.RetetaResponseDto;
import com.manager.farm.pages.retetaPage.retetaIngredient.RetetaIngredient;
import com.manager.farm.pages.retetaPage.retetaIngredient.commandDto.RetetaIngredientDto;
import com.manager.farm.pages.retetaPage.retetaIngredient.queryDto.RetetaIngredientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RetetaService {

    private final RetetaRepository retetaRepository;
    private final RetetaIngredientRepository retetaIngredientRepository;
    private final IngredientRepository ingredientRepository;

    public RetetaService(
            RetetaRepository retetaRepository,
            RetetaIngredientRepository retetaIngredientRepository,
            IngredientRepository ingredientRepository) {
        this.retetaRepository = retetaRepository;
        this.retetaIngredientRepository = retetaIngredientRepository;
        this.ingredientRepository = ingredientRepository;
    }

    @Transactional
    public RetetaResponseDto createReteta(RetetaAddDto dto) {
        // Verifică dacă există deja o rețetă cu același nume
        if (retetaRepository.existsByUserIdAndNume(dto.getUserId(), dto.getNume())) {
            throw new IllegalArgumentException("Există deja o rețetă cu acest nume");
        }

        // Verifică dacă lista de ingrediente nu e goală
        if (dto.getIngrediente() == null || dto.getIngrediente().isEmpty()) {
            throw new IllegalArgumentException("Rețeta trebuie să aibă cel puțin un ingredient");
        }

        // Verifică dacă toate ingredientele există
        for (RetetaIngredientDto ingDto : dto.getIngrediente()) {
            if (!ingredientRepository.existsById(ingDto.getIngredientId())) {
                throw new IllegalArgumentException("Ingredientul cu ID " + ingDto.getIngredientId() + " nu există");
            }
        }

        // 1. Salvează rețeta
        Reteta reteta = new Reteta();
        reteta.setNume(dto.getNume());
        reteta.setDescriere(dto.getDescriere());
        reteta.setDataCreare(LocalDateTime.now());
        reteta.setUserId(dto.getUserId());

        Reteta savedReteta = retetaRepository.save(reteta);

        // 2. Salvează legăturile cu ingredientele
        for (RetetaIngredientDto ingDto : dto.getIngrediente()) {
            RetetaIngredient ri = new RetetaIngredient();
            ri.setRetetaId(savedReteta.getId());
            ri.setIngredientId(ingDto.getIngredientId());
            ri.setCantitate(ingDto.getCantitate());
            retetaIngredientRepository.save(ri);
        }

        // 3. Returnează DTO-ul complet
        return getRetetaCompleta(savedReteta.getId(), dto.getUserId());
    }

    @Transactional
    public RetetaResponseDto updateReteta(Long id, Integer userId, RetetaEditDto dto) {
        Reteta existingReteta = retetaRepository.findByUserIdAndId(userId, id)
                .orElseThrow(() -> new IllegalArgumentException("Rețeta nu a fost găsită"));

        // Verifică dacă noul nume nu e deja folosit (dacă a fost schimbat)
        if (dto.getNume() != null && !dto.getNume().equals(existingReteta.getNume())) {
            if (retetaRepository.existsByUserIdAndNume(userId, dto.getNume())) {
                throw new IllegalArgumentException("Există deja o rețetă cu acest nume");
            }
            existingReteta.setNume(dto.getNume());
        }

        if (dto.getDescriere() != null) {
            existingReteta.setDescriere(dto.getDescriere());
        }

        // Salvează modificările rețetei
        Reteta updatedReteta = retetaRepository.save(existingReteta);

        // Dacă s-au trimis ingrediente noi, actualizează
        if (dto.getIngrediente() != null) {
            // Verifică dacă lista nu e goală
            if (dto.getIngrediente().isEmpty()) {
                throw new IllegalArgumentException("Rețeta trebuie să aibă cel puțin un ingredient");
            }

            // Verifică dacă ingredientele există
            for (RetetaIngredientDto ingDto : dto.getIngrediente()) {
                if (!ingredientRepository.existsById(ingDto.getIngredientId())) {
                    throw new IllegalArgumentException("Ingredientul cu ID " + ingDto.getIngredientId() + " nu există");
                }
            }

            // Șterge legăturile vechi
            retetaIngredientRepository.deleteByRetetaId(id);

            // Adaugă legăturile noi
            for (RetetaIngredientDto ingDto : dto.getIngrediente()) {
                RetetaIngredient ri = new RetetaIngredient();
                ri.setRetetaId(id);
                ri.setIngredientId(ingDto.getIngredientId());
                ri.setCantitate(ingDto.getCantitate());
                retetaIngredientRepository.save(ri);
            }
        }

        return getRetetaCompleta(id, userId);
    }

    @Transactional
    public void deleteReteta(Long id, Integer userId) {
        Reteta reteta = retetaRepository.findByUserIdAndId(userId, id)
                .orElseThrow(() -> new IllegalArgumentException("Rețeta nu a fost găsită"));

        // Șterge mai întâi legăturile, apoi rețeta
        retetaIngredientRepository.deleteByRetetaId(id);
        retetaRepository.delete(reteta);
    }

    public List<RetetaResponseDto> getAllRetete(Integer userId) {
        List<Reteta> retete = retetaRepository.findByUserId(userId);
        return retete.stream()
                .map(r -> getRetetaCompleta(r.getId(), userId))
                .collect(Collectors.toList());
    }

    public RetetaResponseDto getRetetaById(Long id, Integer userId) {
        return getRetetaCompleta(id, userId);
    }

    public List<RetetaResponseDto> getReteteByIngredient(Long ingredientId, Integer userId) {
        List<Reteta> retete = retetaRepository.findByUserId(userId);
        List<RetetaResponseDto> result = new ArrayList<>();

        for (Reteta r : retete) {
            List<RetetaIngredient> ingrediente = retetaIngredientRepository.findByRetetaId(r.getId());
            if (ingrediente.stream().anyMatch(ri -> ri.getIngredientId().equals(ingredientId))) {
                result.add(getRetetaCompleta(r.getId(), userId));
            }
        }

        return result;
    }

    // Metodă privată helper
    private RetetaResponseDto getRetetaCompleta(Long retetaId, Integer userId) {
        Reteta reteta = retetaRepository.findByUserIdAndId(userId, retetaId).orElse(null);
        if (reteta == null) return null;

        List<RetetaIngredient> legaturi = retetaIngredientRepository.findByRetetaId(retetaId);

        List<RetetaResponseDto.IngredientInRetetaDto> ingrediente = new ArrayList<>();

        for (RetetaIngredient ri : legaturi) {
            ingredientRepository.findById(ri.getIngredientId()).ifPresent(ing -> {
                RetetaResponseDto.IngredientInRetetaDto ingDto =
                        new RetetaResponseDto.IngredientInRetetaDto(
                                (long) ing.getId(),
                                ing.getName(),
                                ing.getUnitateMasura(),
                                ri.getCantitate(),
                                ing.getPrice()
                        );
                ingrediente.add(ingDto);
            });
        }

        Double costTotal = ingrediente.stream()
                .mapToDouble(RetetaResponseDto.IngredientInRetetaDto::getPretTotal)
                .sum();

        RetetaResponseDto dto = new RetetaResponseDto();
        dto.setId(reteta.getId());
        dto.setNume(reteta.getNume());
        dto.setDescriere(reteta.getDescriere());
        dto.setDataCreare(reteta.getDataCreare());
        dto.setUserId(reteta.getUserId());
        dto.setIngrediente(ingrediente);
        dto.setCostTotal(costTotal);

        return dto;
    }
}