import { zodResolver } from '@hookform/resolvers/zod'
import { BookMarked, CircleDollarSign, ExternalLink, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { SectionCard } from '../components/ui/card'
import { ContextActionCard } from '../components/ui/context-action-card'
import { EmptyState } from '../components/ui/empty-state'
import { Input } from '../components/ui/input'
import { SectionHeader } from '../components/ui/section-header'
import { Separator } from '../components/ui/separator'
import { wishlistItemSchema, WishlistItemValues, wishlistLinkSchema, WishlistLinkValues } from '../features/wishlist/forms/wishlist-schemas'
import { useAddWishlistItemMutation, useAddWishlistLinkMutation, useDeleteWishlistItemMutation, useWishlistQuery } from '../features/wishlist/queries/use-wishlist'
import { useI18n } from '../shared/i18n/i18n-provider'
import { useToast } from '../shared/toast/toast-provider'

import { FieldBlock, FieldError, PageHeading } from './modules/page-primitives'

export function WishlistPage() {
  const query = useWishlistQuery()
  const addItem = useAddWishlistItemMutation()
  const addLink = useAddWishlistLinkMutation()
  const deleteItem = useDeleteWishlistItemMutation()
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const toast = useToast()
  const { t } = useI18n()

  const itemForm = useForm<WishlistItemValues>({ resolver: zodResolver(wishlistItemSchema), defaultValues: { title: '', author: '', notes: '' } })
  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeading title={t('wishlist.title')} />

      <SectionCard>
        <SectionHeader title={t('journey.wishlistActionsTitle')} description={t('journey.wishlistActionsDescription')} />
        <div className="grid gap-3 md:grid-cols-2">
          <ContextActionCard
            title={t('journey.actions.addWishlistItem.title')}
            description={t('journey.actions.addWishlistItem.description')}
            actionLabel={t('journey.actions.addWishlistItem.cta')}
            icon={<BookMarked className="h-4 w-4" />}
            onAction={() => document.getElementById('wishlist-title-input')?.focus()}
          />
          <ContextActionCard
            title={t('journey.actions.captureLinks.title')}
            description={t('journey.actions.captureLinks.description')}
            actionLabel={t('journey.actions.captureLinks.cta')}
            icon={<ExternalLink className="h-4 w-4" />}
            onAction={() => document.getElementById('wishlist-first-link-input')?.focus()}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader title={t('wishlist.addTitle')} description={t('wishlist.addDescription')} icon={<BookMarked className="h-4 w-4" />} />
        <form onSubmit={itemForm.handleSubmit(async (values) => addItem.mutateAsync({ ...values, expectedPrice: Number.isNaN(values.expectedPrice) ? null : values.expectedPrice ?? null }))} className="grid gap-3 md:grid-cols-2">
          <div><FieldBlock label={t('library.titlePlaceholder')}><Input id="wishlist-title-input" placeholder={t('library.titlePlaceholder')} {...itemForm.register('title')} /></FieldBlock><FieldError message={itemForm.formState.errors.title?.message} /></div>
          <div><FieldBlock label={t('library.authorPlaceholder')}><Input placeholder={t('library.authorPlaceholder')} {...itemForm.register('author')} /></FieldBlock><FieldError message={itemForm.formState.errors.author?.message} /></div>
          <div><FieldBlock label={t('wishlist.expectedPrice')}><Input type="number" step="0.01" placeholder={t('wishlist.expectedPrice')} {...itemForm.register('expectedPrice', { valueAsNumber: true })} /></FieldBlock><FieldError message={itemForm.formState.errors.expectedPrice?.message} /></div>
          <FieldBlock label={t('wishlist.notes')}><Input placeholder={t('wishlist.notes')} {...itemForm.register('notes')} /></FieldBlock>
          <Button type="submit" className="w-full md:col-span-2 md:w-fit" disabled={addItem.isPending}>{t('wishlist.addAction')}</Button>
        </form>
      </SectionCard>

      {!query.isLoading && !query.isError && !query.data?.length ? (
        <EmptyState
          title={t('journey.wishlistEmptyTitle')}
          description={t('journey.wishlistEmptyDescription')}
          action={<Button onClick={() => document.getElementById('wishlist-title-input')?.focus()}>{t('journey.wishlistEmptyAction')}</Button>}
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {query.data?.map((item, index) => (
          <SectionCard key={item.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-small text-mutedForeground">{item.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="border-warning/30 bg-warning/10 text-warning"><CircleDollarSign className="h-3.5 w-3.5" /></Badge>
                {confirmingDeleteId === item.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteItem.isPending}
                      onClick={async () => {
                        try {
                          await deleteItem.mutateAsync(item.id)
                          setConfirmingDeleteId(null)
                          toast.success(t('wishlist.deleteSuccess'))
                        } catch {
                          toast.error(t('wishlist.deleteError'))
                        }
                      }}
                    >
                      {deleteItem.isPending ? t('wishlist.deleting') : t('common.confirm')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={deleteItem.isPending}
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmingDeleteId(item.id)}
                    aria-label={t('wishlist.removeAction')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {confirmingDeleteId === item.id ? <p className="text-xs text-mutedForeground">{t('wishlist.deleteConfirm')}</p> : null}
            <Separator />
            <WishlistLinkForm itemId={item.id} isFirst={index === 0} onSubmit={async (values) => addLink.mutateAsync({ itemId: item.id, ...values })} isPending={addLink.isPending} />
            {item.purchaseLinks.length ? <div className="space-y-2">{item.purchaseLinks.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-mutedForeground hover:bg-secondary"><span className="truncate">{link.label || link.alias}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>)}</div> : null}
          </SectionCard>
        ))}
      </div>
    </div>
  )
}

function WishlistLinkForm({ itemId, onSubmit, isPending, isFirst }: { itemId: string; onSubmit: (values: WishlistLinkValues) => Promise<unknown>; isPending: boolean; isFirst: boolean }) {
  const { t } = useI18n()
  const form = useForm<WishlistLinkValues>({ resolver: zodResolver(wishlistLinkSchema), defaultValues: { label: '', url: '' } })

  return (
    <form onSubmit={form.handleSubmit(async (values) => { await onSubmit(values); form.reset() })} className="space-y-2" key={itemId}>
      <div><FieldBlock label={t('wishlist.linkLabel')}><Input placeholder={t('wishlist.linkLabel')} {...form.register('label')} /></FieldBlock><FieldError message={form.formState.errors.label?.message} /></div>
      <div><div className="flex flex-col gap-2 sm:flex-row"><Input id={isFirst ? 'wishlist-first-link-input' : undefined} placeholder={t('wishlist.urlPlaceholder')} {...form.register('url')} /><Button type="submit" className="w-full sm:w-auto" disabled={isPending}><ExternalLink className="h-4 w-4" /></Button></div><FieldError message={form.formState.errors.url?.message} /></div>
    </form>
  )
}
