import { useEffect, useState } from "react";
import { useService } from "../../service";
import { ResultsService, Stat } from "../../service/results";
import {
  QuoteTypingTestParams,
  TimeTypingTestParams,
  TypingTestParams,
  WordsTypingTestParams,
  quoteLengths,
  timeDurations,
  wordsLengths,
} from "../../service/preferences";
import "./Stats.css";
import { roundToTwoDecimalPlaces } from "../../util/math";

function Stats() {
  const resultsService = useService(ResultsService);

  const [stats, setStats] = useState<Stat[] | undefined>(undefined);

  useEffect(() => {
    resultsService.getStats({}).then((response) => {
      if (response.status === "ok") {
        setStats(response.body.stats);
      }
    });
  }, []);

  if (stats === undefined) {
    return "Loading stats...";
  }

  const mainTimeStats = getMainTimeStats(stats);
  const mainWordsStats = getMainWordsStats(stats);
  const mainQuoteStats = getMainQuoteStats(stats);

  return (
    <div className="Stats">
      <h3 className="StatsTitle">Stats</h3>

      <h4 className="MainStatsTitle">Words</h4>
      <div className="MainStats">
        {mainWordsStats.map((stat) => (
          <MainStatDisplay stat={stat} />
        ))}
      </div>

      <h4 className="MainStatsTitle">Time</h4>
      <div className="MainStats">
        {mainTimeStats.map((stat) => (
          <MainStatDisplay stat={stat} />
        ))}
      </div>

      <h4 className="MainStatsTitle">Quote</h4>
      <div className="MainStats">
        {mainQuoteStats.map((stat) => (
          <MainStatDisplay stat={stat} />
        ))}
      </div>
    </div>
  );
}

function MainStatDisplay({ stat }: { stat: MainStat }) {
  return (
    <div className="MainStat">
      {stat.testParams.mode}{" "}
      {stat.testParams.mode === "words" || stat.testParams.mode === "quote"
        ? stat.testParams.params.length
        : stat.testParams.params.duration}
      {stat.stats !== undefined ? (
        <>
          <div>Best: {roundToTwoDecimalPlaces(stat.stats.bestWpm)}</div>
          <div>Avg: {roundToTwoDecimalPlaces(stat.stats.avgWpm)}</div>
        </>
      ) : (
        <>
          <div>Best: Nil</div>
          <div>Avg: Nil</div>
        </>
      )}
    </div>
  );
}

function getMainWordsStats(stats: Stat[]): MainStat[] {
  const mainWordStats: MainStat[] = [];
  for (const length of wordsLengths) {
    const stat = stats.find(
      (stat) =>
        stat.testParams.mode === "words" &&
        stat.testParams.params.length === length,
    );

    if (!stat) {
      mainWordStats.push({
        testParams: {
          mode: "words",
          params: {
            length,
            language: "english",
          },
        },
      });
    } else {
      mainWordStats.push({
        testParams: stat.testParams,
        stats: {
          ...stat,
        },
      });
    }
  }

  return mainWordStats.sort((a, b) => {
    return (
      (a.testParams as WordsTypingTestParams).params.length -
      (b.testParams as WordsTypingTestParams).params.length
    );
  });
}

function getMainTimeStats(stats: Stat[]): MainStat[] {
  const mainTimeStats: MainStat[] = [];
  for (const duration of timeDurations) {
    const stat = stats.find(
      (stat) =>
        stat.testParams.mode === "time" &&
        stat.testParams.params.duration === duration,
    );

    if (!stat) {
      mainTimeStats.push({
        testParams: {
          mode: "time",
          params: {
            duration,
            language: "english",
          },
        },
      });
    } else {
      mainTimeStats.push({
        testParams: stat.testParams,
        stats: {
          ...stat,
        },
      });
    }
  }

  return mainTimeStats.sort((a, b) => {
    return (
      (a.testParams as TimeTypingTestParams).params.duration -
      (b.testParams as TimeTypingTestParams).params.duration
    );
  });
}

function getMainQuoteStats(stats: Stat[]): MainStat[] {
  const mainQuoteStats: MainStat[] = [];
  for (const length of quoteLengths) {
    const stat = stats.find(
      (stat) =>
        stat.testParams.mode === "quote" &&
        stat.testParams.params.length === length,
    );

    if (!stat) {
      mainQuoteStats.push({
        testParams: {
          mode: "quote",
          params: {
            length,
          },
        },
      });
    } else {
      mainQuoteStats.push({
        testParams: stat.testParams,
        stats: {
          ...stat,
        },
      });
    }
  }

  return mainQuoteStats.sort((a, b) => {
    let aLength = (a.testParams as QuoteTypingTestParams).params.length;
    let bLength = (b.testParams as QuoteTypingTestParams).params.length;
    return quoteLengths.indexOf(aLength) - quoteLengths.indexOf(bLength);
  });
}

interface MainStat {
  testParams: TypingTestParams;
  stats?: {
    bestWpm: number;
    bestRawWpm: number;
    bestAccuracy: number;
    avgWpm: number;
    avgRawWpm: number;
    avgAccuracy: number;
  };
}

export default Stats;
