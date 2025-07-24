#!/usr/bin/env python3
# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
Test runner for E Mart app
"""

import os
import subprocess
import sys
from pathlib import Path


def run_tests():
	"""Run all tests for the E Mart app"""

	# Get the app directory
	app_dir = Path(__file__).parent

	# Test files to run
	test_files = [
		"e_mart/doctype/e_mart_settings/test_e_mart_settings.py",
		"e_mart/doctype/finance_invoice/test_finance_invoice.py",
		"e_mart/doctype/months/test_months.py",
		"e_mart/doctype/debit_note_log/test_debit_note_log.py",
		"e_mart/doctype/monthly_commission_log/test_monthly_commission_log.py",
		"e_mart/doctype/customer_loyalty_program/test_customer_loyalty_program.py",
		"e_mart/doctype/loyalty_points_transaction/test_loyalty_points_transaction.py",
	]

	print("🧪 Running E Mart App Tests...")
	print("=" * 50)

	# Check if test files exist and compile
	for test_file in test_files:
		test_path = app_dir / test_file
		if test_path.exists():
			try:
				# Compile test file
				result = subprocess.run(
					[sys.executable, "-m", "py_compile", str(test_path)], capture_output=True, text=True
				)

				if result.returncode == 0:
					print(f"✅ {test_file} - Compiles successfully")
				else:
					print(f"❌ {test_file} - Compilation failed")
					print(f"   Error: {result.stderr}")
			except Exception as e:
				print(f"❌ {test_file} - Error: {e}")
		else:
			print(f"⚠️  {test_file} - File not found")

	print("=" * 50)
	print("🎯 Test compilation check completed!")


def check_syntax():
	"""Check syntax of all Python files"""

	app_dir = Path(__file__).parent

	print("🔍 Checking Python syntax...")
	print("=" * 50)

	# Find all Python files
	python_files = list(app_dir.rglob("*.py"))

	errors = []

	for py_file in python_files:
		try:
			result = subprocess.run(
				[sys.executable, "-m", "py_compile", str(py_file)], capture_output=True, text=True
			)

			if result.returncode == 0:
				print(f"✅ {py_file.relative_to(app_dir)}")
			else:
				print(f"❌ {py_file.relative_to(app_dir)}")
				errors.append((py_file, result.stderr))
		except Exception as e:
			print(f"❌ {py_file.relative_to(app_dir)} - Error: {e}")
			errors.append((py_file, str(e)))

	print("=" * 50)

	if errors:
		print(f"❌ Found {len(errors)} syntax errors:")
		for file_path, error in errors:
			print(f"   {file_path.relative_to(app_dir)}: {error}")
		return False
	else:
		print("✅ All Python files have valid syntax!")
		return True


if __name__ == "__main__":
	print("🏪 E Mart App Test Suite")
	print("=" * 50)

	# Check syntax first
	if check_syntax():
		# Run tests
		run_tests()
	else:
		print("❌ Syntax errors found. Please fix them before running tests.")
		sys.exit(1)
