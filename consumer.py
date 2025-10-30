from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window
from pyspark.sql.types import StructType, StringType, DoubleType
import os

# -------------------------
# Пути
OUTPUT_PATH = r"D://flowers_web//out//parquet"
CHECKPOINT_PATH = r"D://flowers_web//chkpt"

os.makedirs(OUTPUT_PATH, exist_ok=True)
os.makedirs(CHECKPOINT_PATH, exist_ok=True)

# -------------------------
# SparkSession
spark = (SparkSession.builder
         .appName("KafkaIoTStream")
         .config("spark.eventLog.enabled", "false")
         .getOrCreate())

spark.sparkContext.setLogLevel("INFO")  # показываем логи

# -------------------------
# Схема
schema = StructType() \
    .add("device_id", StringType()) \
    .add("ts", StringType()) \
    .add("temperature", DoubleType()) \
    .add("humidity", DoubleType()) \
    .add("status", StringType())

df = spark.readStream.format("kafka") \
    .option("kafka.bootstrap.servers", "localhost:9092") \
    .option("subscribe", "iot") \
    .option("startingOffsets", "earliest") \
    .option("failOnDataLoss", "false") \
    .load()

# -------------------------
# Преобразуем JSON
json_df = df.select(from_json(col("value").cast("string"), schema).alias("j")).select("j.*")
with_ts = json_df.withColumn("event_time", col("ts").cast("timestamp"))

console_query = json_df.writeStream \
                       .format("console") \
                       .option("truncate", False) \
                       .start()


# -------------------------
# Агрегация
agg = with_ts.groupBy(window(col("event_time"), "1 minute"), col("device_id")) \
             .avg("temperature", "humidity")

# -------------------------
# Поток в Parquet
query = agg.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", OUTPUT_PATH) \
    .option("checkpointLocation", CHECKPOINT_PATH) \
    .trigger(processingTime="20 seconds") \
    .start()

# -------------------------
# Ждем бесконечно
console_query.awaitTermination()
query.awaitTermination()
