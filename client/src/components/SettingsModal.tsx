import OperatorTab from './settings/OperatorTab';
import SystemTab from './settings/SystemTab';
import RiskProfileTab from './settings/RiskProfileTab';
import LayoutTab from './settings/LayoutTab';
import SettingsDialogHeader from './settings/SettingsDialogHeader';
import SettingsFooter from './settings/SettingsFooter';
import { useSettingsForm } from './settings/useSettingsForm';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSaved,
}: SettingsModalProps) {
  const form = useSettingsForm({ isOpen, onClose, onSaved });

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close settings"
      />

      <div className="relative z-10 w-full max-w-2xl animate-slide-up-fade">
        <div className="glass-panel max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-800">
          <SettingsDialogHeader onClose={onClose} />

          {form.loading ? (
            <div className="flex flex-col items-center justify-center gap-4 px-8 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-500" />
              <p className="text-sm text-zinc-500">Loading your preferences...</p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit} className="space-y-8 px-6 py-8 sm:px-8">
              <OperatorTab
                operatorName={form.operatorName}
                onOperatorNameChange={form.setOperatorName}
                nameError={form.validationErrors.name}
              />

              <hr className="border-gray-800" />

              <SystemTab
                selectedAssets={form.selectedAssets}
                onToggleAsset={form.toggleAsset}
                isOtherSelected={form.isOtherSelected}
                onToggleOtherAsset={form.toggleOtherAsset}
                customAssets={form.customAssets}
                onCustomAssetsChange={form.setCustomAssets}
                cryptoAssetsError={form.validationErrors.cryptoAssets}
              />

              <hr className="border-gray-800" />

              <RiskProfileTab
                investorType={form.investorType}
                onInvestorTypeChange={form.selectInvestorType}
                investorTypeError={form.validationErrors.investorType}
              />

              <hr className="border-gray-800" />

              <LayoutTab
                selectedContentTypes={form.selectedContentTypes}
                onToggleContentType={form.toggleContentType}
                contentTypesError={form.validationErrors.contentTypes}
              />

              <SettingsFooter
                error={form.error}
                successMessage={form.successMessage}
                submitting={form.submitting}
                onCancel={onClose}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
