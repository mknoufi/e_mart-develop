# Copyright (c) 2025, efeone and Contributors
# See license.txt

"""
Performance optimization module for E Mart app
"""

import time
from functools import wraps

import frappe
from frappe import _
from frappe.utils import now_datetime


class PerformanceMonitor:
	"""Performance monitoring utilities"""

	@staticmethod
	def time_function(func):
		"""Decorator to time function execution"""

		@wraps(func)
		def wrapper(*args, **kwargs):
			start_time = time.time()
			result = func(*args, **kwargs)
			end_time = time.time()

			execution_time = end_time - start_time
			if execution_time > 1.0:  # Log slow functions
				frappe.logger().warning(f"Slow function: {func.__name__} took {execution_time:.2f} seconds")

			return result

		return wrapper

	@staticmethod
	def cache_result(ttl=3600):
		"""Decorator to cache function results"""

		def decorator(func):
			@wraps(func)
			def wrapper(*args, **kwargs):
				cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
				cached_result = frappe.cache().get_value(cache_key)

				if cached_result is not None:
					return cached_result

				result = func(*args, **kwargs)
				frappe.cache().set_value(cache_key, result, expires_in_sec=ttl)
				return result

			return wrapper

		return decorator


class QueryOptimizer:
	"""Query optimization utilities"""

	@staticmethod
	def optimize_sales_invoice_query():
		"""Optimize sales invoice queries with proper indexing"""
		# Add indexes for frequently queried fields
		indexes = [
			"CREATE INDEX IF NOT EXISTS idx_sales_invoice_posting_date ON `tabSales Invoice` (posting_date)",
			"CREATE INDEX IF NOT EXISTS idx_sales_invoice_customer ON `tabSales Invoice` (customer)",
			"CREATE INDEX IF NOT EXISTS idx_sales_invoice_status ON `tabSales Invoice` (status)",
			"CREATE INDEX IF NOT EXISTS idx_sales_invoice_emi_schedule ON `tabSales Invoice` (emi_schedule)",
		]

		for index in indexes:
			try:
				frappe.db.sql(index)
			except Exception as e:
				frappe.logger().error(f"Index creation failed: {e}")

	@staticmethod
	def batch_process_records(doctype, batch_size=1000):
		"""Process records in batches to avoid memory issues"""
		total_records = frappe.db.count(doctype)

		for offset in range(0, total_records, batch_size):
			records = frappe.get_all(doctype, limit=batch_size, limit_start=offset, fields=["name"])

			for record in records:
				yield record.name


class DatabaseOptimizer:
	"""Database optimization utilities"""

	@staticmethod
	def cleanup_old_logs(days=90):
		"""Clean up old log entries to improve performance"""
		from datetime import timedelta

		cutoff_date = now_datetime() - timedelta(days=days)

		# Clean up old commission logs
		frappe.db.sql(
			"""
			DELETE FROM `tabMonthly Commission Log`
			WHERE creation < %s
		""",
			(cutoff_date,),
		)

		# Clean up old debit note logs
		frappe.db.sql(
			"""
			DELETE FROM `tabDebit Note Log`
			WHERE creation < %s
		""",
			(cutoff_date,),
		)

		frappe.db.commit()

	@staticmethod
	def optimize_tables():
		"""Optimize database tables"""
		tables = [
			"tabSales Invoice",
			"tabPurchase Invoice",
			"tabMonthly Commission Log",
			"tabDebit Note Log",
			"tabFinance Invoice",
		]

		for table in tables:
			try:
				frappe.db.sql(f"OPTIMIZE TABLE `{table}`")
			except Exception as e:
				frappe.logger().error(f"Table optimization failed for {table}: {e}")


class MemoryOptimizer:
	"""Memory optimization utilities"""

	@staticmethod
	def clear_cache():
		"""Clear application cache"""
		frappe.clear_cache()
		frappe.cache().clear()

	@staticmethod
	def monitor_memory_usage():
		"""Monitor memory usage"""
		import psutil

		process = psutil.Process()
		memory_info = process.memory_info()

		# Log if memory usage is high
		if memory_info.rss > 500 * 1024 * 1024:  # 500MB
			frappe.logger().warning(f"High memory usage: {memory_info.rss / 1024 / 1024:.2f} MB")

		return memory_info.rss
