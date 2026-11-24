
import { supabase } from "../config/supabaseClient.js";

const rankingBody = document.getElementById("generalRankingBody");

// Formatar segundos em MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Buscar os 50 melhores resultados
export async function loadRanking() {
    const { data, error } = await supabase
        .from("game_results")
        .select("player_name, countries_found, elapsed_seconds, created_at")
        .order("countries_found", { ascending: false })
        .order("elapsed_seconds", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(50);

    if (error) {
        console.error("Erro ao carregar ranking:", error);
        rankingBody.innerHTML = `
            <tr>
                <td colspan="4">Não foi possível carregar o ranking.</td>
            </tr>
        `;
        return;
    }

    rankingBody.innerHTML = "";

    if (data.length === 0) {
        rankingBody.innerHTML = `
            <tr>
                <td colspan="4">Seja o primeiro a participar!</td>
            </tr>
        `;
        return;
    }

    data.forEach((player, index) => {
        const row = document.createElement("tr");

        const positionCell = document.createElement("td");
        positionCell.textContent = `${index + 1}º`;

        const nameCell = document.createElement("td");
        nameCell.textContent = player.player_name;

        const countriesCell = document.createElement("td");
        countriesCell.textContent = `${player.countries_found}/50`;

        const timeCell = document.createElement("td");
        timeCell.textContent = formatTime(player.elapsed_seconds);

        row.append(
            positionCell,
            nameCell,
            countriesCell,
            timeCell
        );

        rankingBody.appendChild(row);
    });
}
