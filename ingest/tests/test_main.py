from harvest_ingest.__main__ import main


def test_main_exits_cleanly_with_no_jobs():
    assert main() == 0
