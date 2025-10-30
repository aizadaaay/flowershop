import json, time, random, datetime
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

def make_message():
    return {
        "device_id": f"d-{random.randint(1,100)}",
        "ts": datetime.datetime.utcnow().isoformat() + "Z",
        "temperature": round(random.uniform(0,40),2),
        "humidity": round(random.uniform(20,90),2),
        "status": random.choice(["ok","warn","fail"])
    }

for _ in range(1000):
    producer.send("iot", make_message())
    time.sleep(0.01)
producer.flush()
print("1000 хабарлама жіберілді.")
