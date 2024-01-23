use serde::{Deserialize, Serialize};

use crate::preferences::QuoteModeLength;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "mode", content = "params")]
pub enum RandomTestParams {
    Words { language: String, length: u32 },
    Time { language: String, duration: u32 },
    Quote { length: QuoteModeLength },
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(rename_all_fields = "camelCase")]
#[serde(tag = "mode", content = "params")]
pub enum SeededTestParams {
    Words {
        language: String,
        length: u32,
        seed: Seed,
    },
    Time {
        language: String,
        duration: u32,
        seed: Seed,
    },
    Quote {
        length: QuoteModeLength,
        id: usize,
    },
}

pub type Seed = [i32; 4];

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
            SeededTestParams::Quote { length, id: _ } => RandomTestParams::Quote { length },
        }
    }
}
