
import { supabase } from "../config/supabaseClient.js";

export async function saveResult(playerName, countriesFound, elapsedSeconds) {
    const { error } = await supabase
        .from("game_results")
        .insert({
            player_name: playerName,
            countries_found: countriesFound,
            elapsed_seconds: elapsedSeconds
        });

    if (error) {
        console.error("Erro ao salvar resultado:", error);
        return false;
    }

    console.log("Resultado salvo com sucesso!");
    return true;
}
