mod quote;
mod words_or_time;

pub use quote::*;
pub use words_or_time::*;

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
        id: usize,
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
