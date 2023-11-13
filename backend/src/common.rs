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

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    current_mode: Option<TypingTestMode>,

    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    words_mode_language: Option<String>,

    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    words_mode_length: Option<u32>,

    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    time_mode_language: Option<String>,

    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    time_mode_duration: Option<u32>,

    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    quote_mode_length: Option<QuoteModeLength>,

    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    max_chars_in_line: Option<u32>,

    #[serde(default)]
    #[serde(skip_serializing_if = "Option::is_none")]
    show_all_lines: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteModeLength {
    min_length: u32,
    max_length: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TypingTestMode {
    Words,
    Time,
    Quote,
}
