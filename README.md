# node_hw

## Log Generator
Runs indefinitely, creating a new folder every minute and a new log file every 10 seconds with random log entries.

```bash
npm run generate
```

## Log Analyzer
Summarizes logs produced by the generator. Optionally filter by type with `--type`.

```bash
npm run analyze -- --type error
```
