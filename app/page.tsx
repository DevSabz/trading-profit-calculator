import LossTableCalculator from '@/components/LossTableCalculator';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Sabz Loss Table Calculator</h1>
      <LossTableCalculator />
    </div>
  );
}