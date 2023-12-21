use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "mode", content = "params")]
pub enum RandomTestParams {
    Words { language: String, length: u32 },
    Time { language: String, duration: u32 },
    Quote,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "mode", content = "params")]
pub enum SeededTestParams {
    Words {
        language: String,
        length: u32,
        seed: i32,
    },
    Time {
        language: String,
        duration: u32,
        seed: i32,
    },
    Quote {
        id: u32,
    },
}

impl From<SeededTestParams> for RandomTestParams {
    fn from(seeded_test_params: SeededTestParams) -> Self {
        match seeded_test_params {
            SeededTestParams::Words {
                language,
                length,
                seed: _,
            } => RandomTestParams::Words { language, length },
            SeededTestParams::Time {
                language,
                duration,
                seed: _,
            } => RandomTestParams::Time { language, duration },
            SeededTestParams::Quote { id: _ } => RandomTestParams::Quote,
        }
    }
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    current_mode: TypingTestMode,
    words_mode_language: String,
    words_mode_length: u32,
    time_mode_language: String,
    time_mode_duration: u32,
    quote_mode_length: QuoteModeLength,
    max_chars_in_line: u32,
    show_all_lines: bool,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteModeLength {
    min_length: u32,
    max_length: Option<u32>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TypingTestMode {
    #[default]
    Words,
    Time,
    Quote,
}

impl From<String> for Preferences {
    fn from(value: String) -> Self {
        serde_json::from_str(&value).expect("no error")
    }
}

impl ToString for Preferences {
    fn to_string(&self) -> String {
        serde_json::to_string(&self).expect("no error")
    }
}
